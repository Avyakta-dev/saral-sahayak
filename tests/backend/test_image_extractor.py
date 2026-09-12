"""Offline extraction-stage tests. A fake client stands in for the provider."""

import json
import time

import pytest
from test_agent import FakeClient
from test_level_two_api import (  # noqa: F401  (autouse offline guard)
    isolated_environment_and_no_network as isolated_environment_and_no_network,
)

from backend.agent.service import AnalysisError
from backend.images.extractor import admissible_text, echoes_hidden, extract_rejection_text
from backend.llm import LLMError, LLMResult, Message, Usage
from backend.tools.budget import Budget, BudgetLimits

URL = (
    "https://account.r2.cloudflarestorage.com/synthetic-bucket/"
    "inbox/0123456789abcdef0123456789abcdef.png?X-Amz-Signature=synthetic"
)
HOST = "account.r2.cloudflarestorage.com"
MAX_CHARS = 200


def reply(payload):
    return LLMResult(
        message=Message(role="assistant", content=payload),
        finish_reason="stop",
        usage=Usage(output_tokens=42),
    )


def extracted(text, tokens=42):
    return LLMResult(
        message=Message(
            role="assistant", content=json.dumps({"status": "extracted", "text": text})
        ),
        finish_reason="stop",
        usage=Usage(output_tokens=tokens) if tokens is not None else None,
    )


def unreadable():
    return reply(json.dumps({"status": "unreadable", "text": ""}))


def run(
    client,
    budget=None,
    *,
    max_chars=MAX_CHARS,
    max_output_tokens=1000,
    allowed_host=HOST,
    allowed_port=None,
):
    return extract_rejection_text(
        client,
        URL,
        budget if budget is not None else Budget(BudgetLimits()),
        max_chars=max_chars,
        max_output_tokens=max_output_tokens,
        allowed_host=allowed_host,
        allowed_port=allowed_port,
    )


async def test_rejects_a_url_scheme_or_host_other_than_the_configured_endpoint():
    """Defense in depth: image_url is always server-generated in production (see
    ImagePipeline.extract), but this is the boundary that actually sends a URL to a
    third-party LLM provider, so it must never forward an unexpected scheme or host."""
    client = FakeClient(extracted("should never be reached"))
    with pytest.raises(AnalysisError) as wrong_host:
        await run(client, allowed_host="attacker.example.invalid")
    assert wrong_host.value.code == "image_input_unavailable"
    assert len(client.calls) == 0

    with pytest.raises(AnalysisError) as wrong_scheme:
        await extract_rejection_text(
            client,
            URL.replace("https://", "http://"),
            Budget(BudgetLimits()),
            max_chars=MAX_CHARS,
            max_output_tokens=1000,
            allowed_host=HOST,
        )
    assert wrong_scheme.value.code == "image_input_unavailable"
    assert len(client.calls) == 0


async def test_rejects_a_port_other_than_the_configured_endpoints():
    """A URL on an unexpected port must never pass just because the hostname matches -
    port is part of the origin the guard is meant to pin."""
    client = FakeClient(extracted("should never be reached"))
    with pytest.raises(AnalysisError) as wrong_port:
        await run(client, allowed_port=8443)
    assert wrong_port.value.code == "image_input_unavailable"
    assert len(client.calls) == 0

    ported_url = URL.replace(f"https://{HOST}", f"https://{HOST}:8443")
    with pytest.raises(AnalysisError) as unexpected_port:
        await extract_rejection_text(
            client,
            ported_url,
            Budget(BudgetLimits()),
            max_chars=MAX_CHARS,
            max_output_tokens=1000,
            allowed_host=HOST,
        )
    assert unexpected_port.value.code == "image_input_unavailable"
    assert len(client.calls) == 0


async def test_a_trailing_dot_or_case_variant_host_is_still_recognized_as_the_same_host():
    """DNS treats "host" and "host." as the same name; normalizing both sides of the
    comparison means a caller can't dodge the allowlist with an equivalent spelling,
    and a differently-cased configured host still matches the URL's lowercase one."""
    dotted_url = URL.replace(f"https://{HOST}", f"https://{HOST}.")
    text = await extract_rejection_text(
        FakeClient(extracted("Name does not match Aadhaar.")),
        dotted_url,
        Budget(BudgetLimits()),
        max_chars=MAX_CHARS,
        max_output_tokens=1000,
        allowed_host=HOST.upper(),
    )
    assert text == "Name does not match Aadhaar."


async def test_one_tool_free_user_message_carries_the_transient_url():
    client = FakeClient(extracted("Name does not match Aadhaar."))
    text = await run(client)
    assert text == "Name does not match Aadhaar."

    messages, tools, kwargs = client.calls[0]
    assert len(client.calls) == 1  # No retry, no second stage.
    assert messages == [
        Message(
            role="user",
            content=messages[0].content,
            image_urls=(URL,),
        )
    ]
    assert messages[0].role == "user" and messages[0].content.strip()
    assert tools == ()  # Extraction can never read the corpus or call a tool.
    assert kwargs["max_output_tokens"] == 1000
    assert 0 < kwargs["timeout_seconds"] <= 30  # Clamped to the shared request deadline.
    # The signed URL is repr-hidden so it cannot reach a log or a traceback.
    assert URL not in repr(messages[0])


async def test_transcription_is_stripped_and_charged_to_the_shared_budget():
    budget = Budget(BudgetLimits())
    text = await run(FakeClient(extracted("  Name does not match Aadhaar.  ")), budget)
    assert text == "Name does not match Aadhaar."
    assert budget.usage.model_turns == 1
    assert budget.usage.model_output_tokens == 42


async def test_output_ceiling_is_the_smaller_of_stage_and_provider_limits():
    client = FakeClient(extracted("ok"))
    client.config = type("Config", (), {"max_output_tokens": 300, "timeout_seconds": 30})()
    await run(client, max_output_tokens=1000)
    assert client.calls[0][2]["max_output_tokens"] == 300

    client = FakeClient(extracted("ok"))
    await run(client, max_output_tokens=250)
    assert client.calls[0][2]["max_output_tokens"] == 250


async def test_call_timeout_never_outlives_the_shared_deadline():
    client = FakeClient(extracted("ok"))
    await run(client, Budget(BudgetLimits(request_seconds=5)))
    assert client.calls[0][2]["timeout_seconds"] <= 5


async def test_missing_usage_still_charges_measured_bytes():
    budget = Budget(BudgetLimits())
    await run(FakeClient(extracted("Name mismatch.", tokens=None)), budget)
    assert budget.usage.model_output_tokens > 0


async def test_unreadable_output_offers_help_without_guessing():
    with pytest.raises(AnalysisError) as error:
        await run(FakeClient(unreadable()))
    assert error.value.code == "image_unreadable" and error.value.http_status == 422
    assert "paste" in error.value.message


async def test_blank_transcription_counts_as_unreadable():
    with pytest.raises(AnalysisError) as error:
        await run(FakeClient(extracted("   ")))
    assert error.value.code == "image_unreadable"


@pytest.mark.parametrize(
    "payload",
    [
        "",
        "not json at all",
        "[]",
        "[1, 2]",
        "null",
        '{"status": "extracted"}',
        '{"status": "extracted", "text": "ok", "extra": 1}',
        '{"status": "guessed", "text": "ok"}',
        '{"status": "unreadable", "text": "invented"}',
        '{"text": "ok"}',
        '{"status": "extracted", "text": 5}',
        '{"status": "extracted", "text": "a", "status": "extracted"}',
    ],
)
async def test_unsafe_or_malformed_output_stops_without_downstream_work(payload):
    client = FakeClient(reply(payload))
    with pytest.raises(AnalysisError) as error:
        await run(client)
    assert error.value.code in {"image_unreadable", "invalid_image_output"}
    assert len(client.calls) == 1


async def test_oversized_transcription_is_rejected():
    with pytest.raises(AnalysisError) as error:
        await run(FakeClient(extracted("x" * (MAX_CHARS + 1))))
    assert error.value.code == "invalid_image_output" and error.value.http_status == 502

    assert await run(FakeClient(extracted("x" * MAX_CHARS))) == "x" * MAX_CHARS


async def test_signed_url_and_host_echoes_are_rejected():
    for value in (URL, HOST, f"see {URL} for details", HOST.upper()):
        with pytest.raises(AnalysisError) as error:
            await run(FakeClient(extracted(value)))
        assert error.value.code == "invalid_image_output"


@pytest.mark.parametrize(
    "value",
    [
        "![x](data:image/png;base64,AAAA)",
        "javascript:alert(1)",
        "blob:null/abc",
        "file:///etc/passwd",
    ],
)
async def test_unsafe_url_syntax_is_rejected(value):
    with pytest.raises(AnalysisError) as error:
        await run(FakeClient(extracted(value)))
    assert error.value.code == "invalid_image_output"


@pytest.mark.parametrize("control", ["\0", "\u0001", "\u001b", "\u007f"])
async def test_binary_control_characters_are_rejected(control):
    with pytest.raises(AnalysisError) as error:
        await run(FakeClient(extracted(f"Name{control}mismatch")))
    assert error.value.code == "invalid_image_output"


async def test_multiline_and_indic_joiner_text_survives():
    # ZWNJ/ZWJ are Cf, not Cc: legitimate Devanagari/Kannada text must not be over-blocked.
    value = "ನಾಮ\u200dವು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ\nनाम\u200c मेल नहीं खाता"
    assert await run(FakeClient(extracted(value))) == value
    assert admissible_text(value, max_chars=MAX_CHARS)


@pytest.mark.parametrize(
    ("failure", "code", "status"),
    [
        (LLMError("timeout"), "analysis_timeout", 504),
        (LLMError("provider_error"), "model_unavailable", 502),
        (LLMError("auth"), "model_unavailable", 502),
        (LLMError("bad_response"), "model_unavailable", 502),
        (TimeoutError(), "analysis_timeout", 504),
    ],
)
async def test_provider_failures_are_sanitized(failure, code, status):
    client = FakeClient(failure)
    with pytest.raises(AnalysisError) as error:
        await run(client)
    assert error.value.code == code and error.value.http_status == status
    assert "private-detail" not in str(error.value)
    assert len(client.calls) == 1


async def test_unexpected_host_errors_are_left_to_the_api_boundary():
    # A host bug is not provider data: the extractor does not invent a code for it,
    # and main.py converts any unhandled exception into a generic analysis_failed.
    with pytest.raises(RuntimeError):
        await run(FakeClient(RuntimeError("private-detail")))


async def test_exhausted_turn_budget_costs_nothing_and_calls_no_provider():
    budget = Budget(BudgetLimits(model_turns=1))
    budget.begin_model_turn()
    client = FakeClient(extracted("ok"))
    with pytest.raises(AnalysisError) as error:
        await run(client, budget)
    assert error.value.code == "budget_exhausted" and error.value.http_status == 503
    assert client.calls == []


async def test_expired_deadline_calls_no_provider():
    now = [0.0]
    budget = Budget(BudgetLimits(request_seconds=10), clock=lambda: now[0])
    now[0] = 11.0
    client = FakeClient(extracted("ok"))
    with pytest.raises(AnalysisError) as error:
        await run(client, budget)
    assert error.value.code == "budget_exhausted"
    assert client.calls == []


async def test_output_charge_that_exceeds_the_shared_allowance_is_terminal():
    budget = Budget(BudgetLimits(model_output_tokens=10))
    with pytest.raises(AnalysisError) as error:
        await run(FakeClient(extracted("Name mismatch.", tokens=5000)), budget)
    assert error.value.code == "budget_exhausted"


def test_echo_and_text_screens_are_pure_and_case_insensitive():
    assert echoes_hidden(HOST.upper(), (URL,))
    assert not echoes_hidden("nothing here", (URL,))
    assert not echoes_hidden("Name does not match Aadhaar.", (URL, "", "https://x.invalid/"))
    assert not admissible_text("", max_chars=10)
    assert not admissible_text("x" * 11, max_chars=10)
    assert time.monotonic() > 0


@pytest.mark.parametrize(
    "text",
    [
        "0123456789abcdef0123456789abcdef",
        "abcdef0123456789abcdef0123456789",
        "SYNTHETICACCESSKEY123456",
        "SYNTHETICACCESSKEY123456%2F20260101%2Fauto%2Fs3%2Faws4_request",
    ],
)
async def test_isolated_signed_url_secrets_never_leave_extraction(text):
    url = (
        "https://account.r2.cloudflarestorage.com/validated/0123456789abcdef0123456789abcdef.png"
        "?X-Amz-Signature=abcdef0123456789abcdef0123456789"
        "&X-Amz-Credential=SYNTHETICACCESSKEY123456%2F20260101%2Fauto%2Fs3%2Faws4_request"
    )
    with pytest.raises(AnalysisError) as error:
        await extract_rejection_text(
            FakeClient(extracted(text)),
            url,
            Budget(),
            max_chars=8000,
            max_output_tokens=1000,
            allowed_host=HOST,
        )
    assert error.value.code == "invalid_image_output" and text not in str(error.value)


def test_short_url_dates_and_expiry_are_not_treated_as_private_fragments():
    assert not echoes_hidden(
        "Rejected on 20260101 after 120 days",
        (
            "https://account.r2.cloudflarestorage.com/validated/image.png?X-Amz-Date=20260101&X-Amz-Expires=120",
        ),
    )

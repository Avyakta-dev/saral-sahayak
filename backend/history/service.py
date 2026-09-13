"""Lifecycle tracking with opt-in, scoped exact-response reuse.

The default host integration supplies no trusted dependency scope, so every request
still runs the grounded analyzer. Explicitly scoped replay is session-separated and
expires; it preserves validated evidence, never retrieving or generating new guidance.
"""

from typing import Any

from backend.agent.presentation import build_draft
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse

from .store import CaseHistoryStore, validate_cache_scope


class HistoryTrackingService:
    def __init__(
        self,
        inner: Any,
        store: CaseHistoryStore,
        session_id: str,
        *,
        cache_scope: str | None = None,
    ):
        # No default: a shared fallback session id would silently collapse every
        # caller that omits one into a single bucket. The only real caller
        # (backend.main) always derives a per-request id via _session_id(request).
        self._inner = inner
        self._store = store
        self._session_id = session_id
        self._cache_scope = validate_cache_scope(cache_scope)

    async def analyze(self, request: AnalyzeRequest, *, activity: Any = None) -> AnalyzeResponse:
        # Only a direct text request can be cache-checked before any work happens; an
        # image request's text does not exist yet (OCR runs inside the inner service),
        # so it always falls through to a real run. Its result is still recorded below.
        # Details influence classification/actions, not just drafts. They must bypass
        # BOTH lookup and insertion; image/OCR output must never seed a text cache slot.
        has_details = any(value is not None for value in request.details.model_dump().values())
        cacheable = (
            self._cache_scope is not None
            and request.image_key is None
            and bool(request.text)
            and not has_details
        )
        fingerprint_text = request.text or request.image_key or ""
        record = self._store.start(self._session_id, request.language, fingerprint_text)

        if cacheable:
            cached = self._store.find_cached(
                request.language,
                request.text,
                session_id=self._session_id,
                cache_scope=self._cache_scope,
            )
            if cached is not None:
                if cached.status == "success":
                    cached = cached.model_copy(
                        update={"draft": build_draft(request, cached.actions)}
                    )
                self._store.complete(record.case_id, cached, from_cache=True)
                return cached

        self._store.mark_processing(record.case_id)
        try:
            # Match the exact calling convention a caller would have used directly
            # (no explicit activity=None) so wrapping stays invisible to callers/mocks.
            if activity is None:
                response = await self._inner.analyze(request)
            else:
                response = await self._inner.analyze(request, activity=activity)
        except BaseException:
            self._store.fail(record.case_id)
            raise
        self._store.complete(
            record.case_id,
            response,
            from_cache=False,
            cacheable=cacheable,
            cache_scope=self._cache_scope,
        )
        return response

"""Bounded SSE framing only; provider data never leaves the one-turn boundary."""

from collections.abc import Iterator

from .types import require

MAX_STREAM_EVENTS = 16384


class SSEDecoder:
    """Accept UTF-8 split anywhere, LF/CRLF/CR, comments and multiline data.

    The caller bounds *all* decoded HTTP bytes (including comments/unknown SSE
    fields). Lines are decoded only once complete, so fragmented UTF-8 is safe.
    EOF never dispatches a truncated event.
    """

    def __init__(self) -> None:
        self.line = bytearray()
        self.data: list[str] = []
        self.event = ""
        self.after_cr = False
        self.first_line = True
        self.events = 0

    def feed(self, chunk: bytes) -> Iterator[tuple[str, str]]:
        for byte in chunk:
            if self.after_cr:
                self.after_cr = False
                if byte == 10:
                    continue
            if byte not in (10, 13):
                self.line.append(byte)
                continue
            self.after_cr = byte == 13
            line = self.line.decode("utf-8")
            self.line.clear()
            if self.first_line:
                line = line.removeprefix("\ufeff")
                self.first_line = False
            if not line:
                self.events += 1
                require(self.events <= MAX_STREAM_EVENTS)
                event, data = self.event, self.data
                self.event, self.data = "", []
                if data:
                    yield event, "\n".join(data)
            elif not line.startswith(":"):
                field, _, value = line.partition(":")
                value = value.removeprefix(" ")
                if field == "data":
                    self.data.append(value)
                elif field == "event":
                    self.event = value

    def finish(self) -> None:
        require(not self.line and not self.data and not self.event)

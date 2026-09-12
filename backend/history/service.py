"""Lifecycle-tracking, caching wrapper around an analysis service.

Presents the same ``analyze(request, *, activity=None)`` seam as AnalysisService and
_SharedBudgetService (backend.main), so it can wrap either one without either side
knowing the other exists. On a cache hit it returns a previously validated response
untouched (aside from a freshly rebuilt draft) and never invokes the model or reads
any knowledge file - that is the whole point: identical repeat questions cost nothing
the second time and answer instantly, without ever widening what counts as a match
beyond an exact (language, text) repeat.
"""

from typing import Any

from backend.agent.presentation import build_draft
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse

from .models import DEFAULT_SESSION_ID
from .store import CaseHistoryStore


class HistoryTrackingService:
    def __init__(
        self,
        inner: Any,
        store: CaseHistoryStore,
        session_id: str = DEFAULT_SESSION_ID,
    ):
        self._inner = inner
        self._store = store
        self._session_id = session_id

    async def analyze(self, request: AnalyzeRequest, *, activity: Any = None) -> AnalyzeResponse:
        # Only a direct text request can be cache-checked before any work happens; an
        # image request's text does not exist yet (OCR runs inside the inner service),
        # so it always falls through to a real run. Its result is still recorded below.
        cacheable = request.image_key is None and bool(request.text)
        fingerprint_text = request.text if cacheable else (request.image_key or "")
        record = self._store.start(self._session_id, request.language, fingerprint_text)

        if cacheable:
            cached = self._store.find_cached(request.language, request.text)
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
        # request.details reaches the model (it is serialized whole into the prompt -
        # see backend.agent.service._analyze), so a response produced from a request
        # that carried any detail must never become a shared, cross-session cache
        # entry: nothing structurally stops the model from echoing a name/claim id
        # into classification/explanation/actions text, only prompt instructions do.
        # A details-free request is unaffected and still seeds the shared cache.
        has_details = any(value is not None for value in request.details.model_dump().values())
        self._store.complete(record.case_id, response, from_cache=False, cacheable=not has_details)
        return response

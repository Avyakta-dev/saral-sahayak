from backend.images.catbox import CATBOX_API, CatboxStorage
from backend.images.config import ImageConfig
from backend.images.storage import InvalidImage, new_object_key


class FakeHttp:
    def __init__(self, text="https://files.catbox.moe/abcd12.png", status=200):
        self.text = text
        self.status = status
        self.calls = []

    def post(self, url, data=None, files=None):
        self.calls.append((url, data, files))

        class Response:
            status_code = self.status
            text = self.text

        return Response()


def config():
    return ImageConfig(
        endpoint="https://files.catbox.moe",
        bucket="catbox",
        lifecycle_configured=True,
    )


def test_inbox_put_and_read_roundtrip():
    store = CatboxStorage(config())
    key = new_object_key(config(), "image/png")
    path, ttl = store.presign_put(key, "image/png", 4)
    assert path.endswith(key)
    assert ttl == 120
    store.receive_put(key, "image/png", b"PNG!")
    assert store._inbox[key] == ("image/png", b"PNG!")


def test_validated_png_uploads_to_catbox_api():
    http = FakeHttp()
    store = CatboxStorage(config(), http_client=http)
    import asyncio

    asyncio.run(store.put_validated("validated/" + "a" * 32 + ".png", b"1234"))
    assert http.calls[0][0] == CATBOX_API
    assert http.calls[0][1] == {"reqtype": "fileupload"}
    assert store.presign_get("validated/" + "a" * 32 + ".png") == "https://files.catbox.moe/abcd12.png"


def test_rejects_wrong_type():
    store = CatboxStorage(config())
    key = new_object_key(config(), "image/png")
    try:
        store.receive_put(key, "image/gif", b"nope")
    except InvalidImage:
        return
    raise AssertionError("expected InvalidImage")

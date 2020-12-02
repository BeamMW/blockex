import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import explorer.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blockex.settings")

application = ProtocolTypeRouter({
  "websocket": AuthMiddlewareStack(
        URLRouter(
            explorer.routing.websocket_urlpatterns
        )
    ),
})


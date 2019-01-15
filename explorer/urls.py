from django.conf.urls import url, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'blocks', BlockViewSet)


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
	url(r'^status/$', get_status),
	url(r'^range/$', get_block_range),
	url(r'^block/$', get_block),
	url(r'^search/$', search),
	url(r'^major_block/$', get_major_block),
	url(r'^totalcoins/$', get_total_coins),
    url(r'^', include(router.urls)),
]
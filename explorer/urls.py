from django.conf.urls import url, include
from rest_framework import routers
from .views import *
from django.views.decorators.csrf import csrf_exempt

from django.urls import path
from .views import BotView

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
    url(r'^coins_in_circulation_mined/$', get_coins_in_circulation_mined),
    url(r'^coins_in_circulation_treasury/$', get_coins_in_circulation_treasury),
    url(r'^total_coins_in_circulation/$', get_total_coins_in_circulation),
    url(r'^totalcoins/$', get_total_coins_in_circulation),
    url(r'^next_treasury_emission_block_height/$', get_next_treasury_emission_block_height),
    url(r'^next_treasury_emission_coin_amount/$', get_next_treasury_emission_coin_amount),
    url(r'^total_emission/$', get_total_emission),
    url(r'^block_by_kernel/$', get_block_by_kernel),
    url(r'^get_detected_forks/$', get_detected_forks),
    url(r'^get_assets_list/$', get_assets_list),
    path('webhooks/bot/', csrf_exempt(BotView.as_view())),
    url(r'^', include(router.urls)),
]

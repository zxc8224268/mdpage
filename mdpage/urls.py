from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path('', views.overview, name='mdpage-overview'),
    path('<current_group_name>/', views.itemsListNameView, name='mdpage-itemsListName'),
    path('group/<current_group_key>/', views.itemsListView, name='mdpage-itemsList'),
    path('item/<current_item_key>/', views.itemDetailView, name='mdpage-itemDetail'),
    path('item/<current_item_key>/edit/', views.itemEditorView, name='mdpage-itemEditor'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

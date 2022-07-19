from django.contrib import admin
from .models import MdGroup, MdItem, MdImage

# 可以重新定義在 admin 當中的 post list 預覽表格
class MdGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'order', 'updated_on', 'created_on')
    list_filter = ("status",)
    search_fields = ['name', 'content']
    prepopulated_fields = {
        # 'group_slug': ('name',)
    }

class MdItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'group', 'tags', 'updated_on', 'created_on')
    search_fields = ['name', 'content', 'tags']
    prepopulated_fields = {}

class MdImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'image', 'item', 'updated_on', 'created_on')
    search_fields = ['name', 'image']
    prepopulated_fields = {}

admin.site.register(MdGroup, MdGroupAdmin)
admin.site.register(MdItem, MdItemAdmin)
admin.site.register(MdImage, MdImageAdmin)

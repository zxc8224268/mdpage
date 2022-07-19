from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.urls import resolve, reverse
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
from django.utils.functional import empty
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from pytz import timezone 

settings_time_zone = timezone(settings.TIME_ZONE) 

from .models import MdGroup, MdItem, MdImage
import json

# ----------------------------------
#   Overview
# ----------------------------------
@csrf_exempt # disable csrf
def overview(request):
    if request.is_ajax() and request.method == 'POST':
        mission = request.POST.get('mission')
        # Group edit
        if mission == 'edit':
            edit_group = MdGroup.objects.get(id=request.POST.get('id'))
            try:
                edit_group.name = request.POST.get('name')
                edit_group.status = request.POST.get('status')
                edit_group.save()
                return HttpResponse(json.dumps({
                   'name':  edit_group.name,
                   'status': edit_group.status,
                   'id': edit_group.id,
                }))
            except:
                return HttpResponse('fail')
        # Group create
        elif mission == 'create':
            created_name = request.POST.get('name')
            created_status = request.POST.get('status')
            try:
                MdGroup.objects.create(
                    name = created_name,
                    creator = request.user,
                    status = created_status,
                )
                created_group = MdGroup.objects.get(name=created_name)
                return HttpResponse(json.dumps({
                    'id': created_group.id,
                    'name': created_name,
                    'status': created_status,
                }))
            except:
                return HttpResponse('fail')
        # Group delete
        elif mission == 'delete':
            delete_id = request.POST.get('id')
            try:
                MdGroup.objects.get(id=delete_id).delete()
                return HttpResponse(json.dumps({
                    'id': delete_id
                }))
            except:
                return HttpResponse('fail')
        # Group update orders
        elif mission == 'update_orders':
            orders_map = request.POST.get('orders_map').split(',')
            if orders_map != ['']:
                for order_map in orders_map:
                    group_to_order = MdGroup.objects.get(id=order_map.split(':')[0])
                    group_to_order.status = order_map.split(':')[1]
                    group_to_order.order = order_map.split(':')[2]
                    group_to_order.save()
    context = {
        'public_groups': MdGroup.objects.filter(status=1).order_by('order'),
        'private_groups': MdGroup.objects.filter(status=0).order_by('order'),
    }
    return render(request, 'overview.html', context)

# ----------------------------------
#   Item List View
# ----------------------------------
@csrf_exempt # disable csrf
def itemsListNameView(request, current_group_name):
    try:
        current_group_id = MdGroup.objects.get(name=current_group_name).id
        return redirect('mdpage-itemsList', current_group_key=current_group_id)
    except:
        return HttpResponse(status=404)

@csrf_exempt # disable csrf
def itemsListView(request, current_group_key):
    current_group = MdGroup.objects.get(id=current_group_key)
    # Safety: Make sure private group access by its creator
    if current_group.status == 0 and current_group.creator != request.user:
        # Redirect to login page to be more convinent
        return HttpResponseRedirect(request.META.get('HTTP_REFERER','/login/?next=/group/'+current_group_key))
    else:
        if request.is_ajax() and request.method == 'POST':
            mission = request.POST.get('mission')
            # Item create
            if mission == 'create':
                created_item_name = request.POST.get('name')
                try:
                    MdItem.objects.create(
                        name = created_item_name,
                        group = current_group,
                        creator = request.user
                    )
                    last_created_item = MdItem.objects.filter(name=created_item_name)[0]
                    return HttpResponse(json.dumps({
                        'name': created_item_name,
                        'created_on': str(last_created_item.created_on.astimezone(settings_time_zone))[:16],
                        'creator': str(request.user),
                        'id': last_created_item.id
                    }))
                except:
                    return HttpResponse('Repeat the name')
            # Item delete
            elif mission == 'delete':
                delete_id = request.POST.get('id')
                try:
                    MdItem.objects.get(id=delete_id).delete()
                    return HttpResponse(status=200)
                except:
                    return HttpResponse('fail')
        context = {
            'items': MdItem.objects.filter(group=current_group),
            'group': current_group,
        }
        return render(request, 'itemsList.html', context)

# ----------------------------------
#   Item Detail View
# ----------------------------------
@csrf_exempt 
def itemDetailView(request, current_item_key):
    current_item = MdItem.objects.get(id=current_item_key)
    # Safety: Make sure private group access by its creator
    if current_item.group.status == 0 and current_item.group.creator != request.user:
        return redirect('mdpage-overview') # Forbidden and redirect to overview page
    else:
        # render
        context = {
            'item': current_item,
        }
        return render(request, 'itemDetail.html', context)

# ----------------------------------
#   Item Editor View
# ----------------------------------
# @login_required
@csrf_exempt # disable csrf
def itemEditorView(request, current_item_key):
    current_item = MdItem.objects.get(id=current_item_key)
    # Safety: Make sure private group access by its creator
    if current_item.group.creator != request.user:
        return redirect('mdpage-overview') # Forbidden and redirect to overview page
    else:
        if request.is_ajax() and request.method == 'POST':
            mission = request.POST.get('mission')
            # Update item
            if mission == "update_item":
                current_item.content = request.POST.get('content')
                current_item.group = MdGroup.objects.get(name=request.POST.get('group'))
                current_item.name = request.POST.get('name')
                current_item.tags = request.POST.get('tags')
                current_item.save()
            # Upload image
            elif mission == 'upload_image':
                name = request.POST.get('name')
                image = request.FILES.get('image')
                created_image = MdImage(name=name, image=image, item=current_item)
                created_image.save()
            # Delete image
            elif mission == 'delete_image':
                delete_id = request.POST.get('delete_id')
                try:
                    MdImage.objects.get(id=delete_id).delete()
                    return HttpResponse(status=200)
                except:
                    return HttpResponse('fail')
        # render
        context = {
            'item': current_item,
            'imgs': MdImage.objects.filter(item=current_item),
            'own_groups': MdGroup.objects.filter(creator=request.user),
        }
        return render(request, 'itemEditor.html', context)
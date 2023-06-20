from django.shortcuts import redirect, render
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from mainapp.forms import RegisterForm

# Create your views here.
def index(request):

    title = 'Inicio'

    return render(request,'mainapp/index.html',{
        'title' : title
    })

def about(request):

    title = 'Sobre nosotros'
    
    return render(request,'mainapp/about.html',{
        'title' : title
    })

def register_page(request):
    
    if request.user.is_authenticated:
        return redirect('inicio') 
    else:

        title = 'Registrate'
        
        register_form = RegisterForm()

        if request.method == 'POST':

            register_form = RegisterForm(request.POST)

            if register_form.is_valid():

                register_form.save()

                messages.success(request, 'Te has registrado Correctamente!!')

                return redirect('inicio')

        return render(request, 'users/register.html',{
            'title' : title,
            'register_form' : register_form
        })

def login_page(request):

    if request.user.is_authenticated:
        return redirect('inicio') 
    else:
        
        title = 'Identificate'

        if request.method == 'POST':

            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('inicio')
            else:
                messages.warning(request, 'No te has identificado correctamente :(')    

        return render(request, 'users/login.html',{
            'title' : title
        })

def logout_user(request):
    logout(request)
    return redirect('login')

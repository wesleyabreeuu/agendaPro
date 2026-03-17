@extends('adminlte::auth.login')

@section('title', 'Login - AgendaPro')

@section('auth_header', 'Acesse sua conta')

@section('auth_body')
<form method="POST" action="{{ route('login') }}">
    @csrf

    <div class="input-group mb-3">
        <input type="email" name="email" class="form-control"
               value="{{ old('email') }}" placeholder="E-mail" required autofocus>
        <div class="input-group-append">
            <div class="input-group-text">
                <span class="fas fa-envelope"></span>
            </div>
        </div>
    </div>

    <div class="input-group mb-3">
        <input type="password" name="password" class="form-control"
               placeholder="Senha" required>
        <div class="input-group-append">
            <div class="input-group-text">
                <span class="fas fa-lock"></span>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-8">
            <div class="icheck-primary">
                <input type="checkbox" name="remember" id="remember">
                <label for="remember">
                    Lembrar-me
                </label>
            </div>
        </div>

        <div class="col-4">
            <button type="submit" class="btn btn-primary btn-block">
                Entrar
            </button>
        </div>
    </div>
</form>
@endsection

@section('auth_footer')
<a href="{{ route('password.request') }}">Esqueceu sua senha?</a>

@endsection

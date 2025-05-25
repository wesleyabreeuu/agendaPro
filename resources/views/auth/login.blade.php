@extends('adminlte::auth.auth-page', ['auth_type' => 'login'])

@section('title', 'Login - AgendaPro')

@section('auth_header', 'Acesse sua conta')

@section('auth_body')
    <form action="{{ route('login') }}" method="POST">
        @csrf

        <div class="form-group">
            <label for="email">E-mail</label>
            <input id="email" type="email" class="form-control" name="email"
                   value="{{ old('email') }}" required autofocus>
        </div>

        <div class="form-group">
            <label for="password">Senha</label>
            <input id="password" type="password" class="form-control" name="password" required>
        </div>

        <div class="form-check mb-3">
            <input type="checkbox" name="remember" class="form-check-input" id="remember" {{ old('remember') ? 'checked' : '' }}>
            <label class="form-check-label" for="remember">Lembrar-me</label>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Entrar</button>
    </form>
@endsection

@section('auth_footer')
    <a href="{{ route('password.request') }}">Esqueceu sua senha?</a>
@endsection

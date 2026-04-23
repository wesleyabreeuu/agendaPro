<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use ResetsPasswords;

    /**
     * Where to redirect users after resetting their password.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    public function showResetForm(Request $request, $token = null): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'mode' => 'token',
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    public function showCodeForm(Request $request): RedirectResponse|Response
    {
        $email = $request->session()->get('password_reset_email');

        if (!$email) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Informe seu e-mail para receber o codigo de recuperacao.');
        }

        return Inertia::render('Auth/VerifyResetCode', [
            'email' => $email,
            'status' => session('status'),
        ]);
    }

    public function verifyCode(Request $request): RedirectResponse
    {
        $sessionEmail = $request->session()->get('password_reset_email');

        if (!$sessionEmail) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Sua solicitacao expirou. Informe o e-mail novamente.');
        }

        $validated = $request->validate([
            'code' => ['required', 'digits:6'],
        ], [
            'code.required' => 'Informe o codigo enviado por e-mail.',
            'code.digits' => 'O codigo precisa ter 6 digitos.',
        ]);

        $resetCode = PasswordResetCode::query()->where('email', $sessionEmail)->first();

        if (!$resetCode) {
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->with('status', 'Solicite um novo codigo para continuar.');
        }

        if ($resetCode->expires_at->isPast()) {
            $resetCode->delete();
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->with('status', 'O codigo expirou. Solicite um novo envio.');
        }

        if ($resetCode->attempts >= 5) {
            $resetCode->delete();
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->with('status', 'Voce excedeu as tentativas. Solicite um novo codigo.');
        }

        if (!Hash::check($validated['code'], $resetCode->code)) {
            $resetCode->increment('attempts');

            return back()->withErrors([
                'code' => 'Codigo invalido. Confira o e-mail e tente novamente.',
            ]);
        }

        $resetCode->forceFill([
            'verified_at' => now(),
            'attempts' => 0,
        ])->save();

        $request->session()->put('password_reset_verified_email', $sessionEmail);

        return redirect()->route('password.direct.reset.form');
    }

    public function showDirectResetForm(Request $request): RedirectResponse|Response
    {
        $email = $request->session()->get('password_reset_verified_email');

        if (!$email) {
            return redirect()
                ->route('password.code.form')
                ->with('status', 'Digite o codigo enviado por e-mail antes de alterar a senha.');
        }

        $resetCode = PasswordResetCode::query()->where('email', $email)->first();

        if (!$resetCode || !$resetCode->verified_at || $resetCode->expires_at->isPast()) {
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->with('status', 'Sua verificacao expirou. Solicite um novo codigo.');
        }

        return Inertia::render('Auth/ResetPassword', [
            'mode' => 'direct',
            'token' => null,
            'email' => $email,
        ]);
    }

    public function updateDirect(Request $request): RedirectResponse
    {
        $sessionEmail = $request->session()->get('password_reset_verified_email');

        if (!$sessionEmail) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Sua verificacao expirou. Solicite um novo codigo para continuar.');
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'email.required' => 'Informe o e-mail da conta.',
            'email.email' => 'Informe um e-mail valido.',
            'password.required' => 'Informe a nova senha.',
            'password.confirmed' => 'A confirmacao da senha nao confere.',
            'password.min' => 'A nova senha deve ter pelo menos 8 caracteres.',
        ]);

        if ($validated['email'] !== $sessionEmail) {
            return back()->withErrors([
                'email' => 'O e-mail informado nao corresponde ao usuario verificado.',
            ]);
        }

        $resetCode = PasswordResetCode::query()->where('email', $sessionEmail)->first();

        if (!$resetCode || !$resetCode->verified_at || $resetCode->expires_at->isPast()) {
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->with('status', 'Sua verificacao expirou. Solicite um novo codigo.');
        }

        $user = User::query()->where('email', $sessionEmail)->first();

        if (!$user) {
            $resetCode?->delete();
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->withErrors([
                    'email' => 'Essa conta nao esta mais cadastrada.',
                ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        $resetCode->delete();
        $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

        return redirect()
            ->route('login')
            ->with('status', 'Senha alterada com sucesso. Agora voce ja pode entrar.');
    }
}

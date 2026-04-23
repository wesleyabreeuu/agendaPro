<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
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

    public function showDirectResetForm(Request $request): RedirectResponse|Response
    {
        $email = $request->session()->get('password_reset_email');

        if (!$email) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Informe seu e-mail para verificar o cadastro antes de alterar a senha.');
        }

        return Inertia::render('Auth/ResetPassword', [
            'mode' => 'direct',
            'token' => null,
            'email' => $email,
        ]);
    }

    public function updateDirect(Request $request): RedirectResponse
    {
        $sessionEmail = $request->session()->get('password_reset_email');

        if (!$sessionEmail) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Sua verificacao expirou. Informe o e-mail novamente para continuar.');
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

        $user = User::query()->where('email', $sessionEmail)->first();

        if (!$user) {
            $request->session()->forget('password_reset_email');

            return redirect()
                ->route('password.request')
                ->withErrors([
                    'email' => 'Essa conta nao esta mais cadastrada.',
                ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        $request->session()->forget('password_reset_email');

        return redirect()
            ->route('login')
            ->with('status', 'Senha alterada com sucesso. Agora voce ja pode entrar.');
    }
}

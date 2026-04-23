<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ForgotPasswordController extends Controller
{
    public function showLinkRequestForm(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function verifyAccount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Informe o e-mail para continuar.',
            'email.email' => 'Informe um e-mail valido.',
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (!$user) {
            return back()
                ->withErrors([
                    'email' => 'Nao encontramos conta cadastrada com esse e-mail.',
                ])
                ->withInput();
        }

        $this->sendResetCode($user->email);

        $request->session()->put('password_reset_email', $user->email);
        $request->session()->forget('password_reset_verified_email');

        return redirect()
            ->route('password.code.form')
            ->with('status', 'Enviamos um codigo de verificacao para o seu e-mail.');
    }

    public function resendCode(Request $request): RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');

        if (!$email) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Informe seu e-mail novamente para continuar a recuperacao.');
        }

        $user = User::query()->where('email', $email)->first();

        if (!$user) {
            $request->session()->forget(['password_reset_email', 'password_reset_verified_email']);

            return redirect()
                ->route('password.request')
                ->withErrors([
                    'email' => 'Nao encontramos conta cadastrada com esse e-mail.',
                ]);
        }

        $this->sendResetCode($user->email);

        return back()->with('status', 'Enviamos um novo codigo para o seu e-mail.');
    }

    private function sendResetCode(string $email): void
    {
        $code = (string) random_int(100000, 999999);

        PasswordResetCode::query()->updateOrCreate(
            ['email' => $email],
            [
                'code' => Hash::make($code),
                'expires_at' => now()->addMinutes(10),
                'attempts' => 0,
                'verified_at' => null,
            ]
        );

        Mail::raw(
            "Seu codigo para recuperar a senha do AgendaPro e: {$code}\n\n".
            "Ele expira em 10 minutos. Se voce nao solicitou essa alteracao, ignore este e-mail.",
            function ($message) use ($email): void {
                $message
                    ->to($email)
                    ->subject('Codigo de recuperacao de senha - AgendaPro');
            }
        );
    }
}

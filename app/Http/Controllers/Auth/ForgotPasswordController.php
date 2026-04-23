<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

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

        $request->session()->put('password_reset_email', $user->email);

        return redirect()->route('password.direct.reset.form');
    }
}

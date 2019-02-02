export interface SignInPageObjectModel {
    path: string;
    signInButton: string;
    usernameInput: string;
    passwordInput: string;
}

export default {
    path: '/sign-in.html',
    signInButton: '#body-signin button',
    usernameInput: '#body-signin input[type="email"]',
    passwordInput: '#body-signin input[type="password"]',
};
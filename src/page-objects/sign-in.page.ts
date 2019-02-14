import { PageObjectModel } from './page';

export interface SignInPageObjectModel extends PageObjectModel {
    signInButton: string;
    usernameInput: string;
    passwordInput: string;
}

export default <SignInPageObjectModel>{
    path: '/sign-in.html',
    signInButton: '#body-signin button',
    usernameInput: '#body-signin input[type="email"]',
    passwordInput: '#body-signin input[type="password"]',
};
// Type definitions for passport-facebook 1.0.3
// Project: https://github.com/jaredhanson/passport-facebook
// Definitions by: James Roland Cabresos <https://github.com/staticfunction>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module 'passport-google-oauth' {

    import passport = require('passport');
    import express = require('express');

    interface Profile extends passport.Profile {
        gender: string;

        _raw: string;
        _json: any;
    }

    interface IOAuthStrategyOption {
        consumerKey: string;
        consumerSecret: string;
        callbackURL: string;

        passReqToCallback? : boolean;
        reguestTokenURL?: string;
        accessTokenURL?: string;
        userAuthorizationURL?: string;
        sessionKey?: string;
    }

    class OAuthStrategy implements passport.Strategy {
        constructor(options: IOAuthStrategyOption,
                    verify: (req : express.Request, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);

        constructor(options: IOAuthStrategyOption,
                    verify: (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);

        name: string;
        authenticate: (req: express.Request, options?: Object) => void;
    }

    interface IOAuth2StrategyOption {
        clientID: string;
        clientSecret: string;
        callbackURL: string;

        authorizationURL?: string;
        tokenURL?: string;

        accessType?: string;
        approval_prompt?: string;
        prompt?: string;
        loginHint?: string;
        userID?: string;
        hostedDomain?: string;
        display?: string;
        requestVisibleActions?: string;
        openIDRealm?: string;
        passReqToCallback? : boolean;

    }

    class OAuth2Strategy implements passport.Strategy {
        constructor(options: IOAuth2StrategyOption,
                    verify: (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);

        constructor(options: IOAuth2StrategyOption,
                    verify: (req : express.Request, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);

        name: string;
        authenticate: (req: express.Request, options?: Object) => void;
    }
}

// Type definitions for passport-facebook 1.0.3
// Project: https://github.com/jaredhanson/passport-facebook
// Definitions by: James Roland Cabresos <https://github.com/staticfunction>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module 'passport-linkedin' {

    import passport = require('passport');
    import express = require('express');

    interface Profile extends passport.Profile {
        gender: string;
        username: string;

        _raw: string;
        _json: any;
        _accessLevel: string;
    }

    interface IStrategyOption {
        consumerKey: string;
        consumerSecret: string;
        callbackURL: string;

        reguestTokenURL?: string;
        accessTokenURL?: string;
        userAuthorizationURL?: string;
        sessionKey?: string;

        userProfileURL?: string;
        skipExtendedUserProfile?: boolean;
        passReqToCallback? : boolean;

        profileFields? : string[];
    }

    class Strategy implements passport.Strategy {
        constructor(options: IStrategyOption,
                    verify: (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);

        constructor(options: IStrategyOption,
                    verify: (req : express.Request, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);
        name: string;
        authenticate: (req: express.Request, options?: Object) => void;
    }
}

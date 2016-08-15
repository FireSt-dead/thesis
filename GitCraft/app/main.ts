// this import should be first in order to load some required settings (like globals and reflect-metadata)
import {nativeScriptBootstrap} from "nativescript-angular/application";
import {AppComponent} from "./app.component";

// HACK: Dirty hace to workaround NSHttp's get not assignable to Http for some Observable type collisions.
declare var NS_HTTP_PROVIDERS;
var NS_HTTP_PROVIDERS = require("nativescript-angular/http").NS_HTTP_PROVIDERS;

nativeScriptBootstrap(AppComponent, [NS_HTTP_PROVIDERS]);

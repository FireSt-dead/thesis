import {nativeScriptBootstrap} from "nativescript-angular/application";
import {AppComponent, APP_ROUTER_PROVIDERS} from "./app.component";
import {GITHUB_SERVICE_PROVIDER} from "./github.service";

// Run Angular 2 diagnostics...
// import { rendererTraceCategory } from "nativescript-angular/trace";
// import trace = require("trace");
// trace.setCategories(rendererTraceCategory);
// trace.enable();

declare var NS_HTTP_PROVIDERS;
var NS_HTTP_PROVIDERS = require("nativescript-angular/http").NS_HTTP_PROVIDERS;

console.log("nativeScriptBootstrap");
nativeScriptBootstrap(AppComponent, [NS_HTTP_PROVIDERS, APP_ROUTER_PROVIDERS, GITHUB_SERVICE_PROVIDER]);


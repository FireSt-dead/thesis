import {platformNativeScriptDynamic, NativeScriptModule} from "nativescript-angular/platform";
import {NgModule} from "@angular/core";
import {NativeScriptRouterModule} from "nativescript-angular/router";

import {NativeScriptHttpModule} from 'nativescript-angular/http';

import 'rxjs/add/operator/map';

import {BackgroundColorPipe, ColorPipe} from "./github.color.pipe";

import {AppComponent} from "./app.component";
import {HomeComponent} from "./home.component";
import {UserComponent} from "./user.component";
import {RepositoriesComponent} from "./repositories.component";
import {RepositoryComponent} from "./repository.component";
import {MilestoneComponent} from "./milestone.component";
import {NotificationsComponent} from "./notifications.component";
import {IssueComponent} from "./issue.component";

import {GitHubService} from "./github.service";

import * as application from  "application";
import { isAndroid, isIOS } from "platform";

if (isIOS) {
    class AppDelegate extends NSObject implements UIApplicationDelegate {
        static ObjCProtocols = [UIApplicationDelegate];
        applicationHandleOpenURL(app, url): boolean {
            return GitHubService.applicationHandleOpenURL(application, url);
        }
    }
    application.ios.delegate = AppDelegate;
} else if (isAndroid) {
    GitHubService.registerForURLIntent();
}

@NgModule({
    declarations: [
        BackgroundColorPipe,
        ColorPipe,

        AppComponent,

        HomeComponent,
        UserComponent,
        RepositoriesComponent,
        RepositoryComponent,
        MilestoneComponent,
        NotificationsComponent,
        IssueComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        NativeScriptModule,
        NativeScriptHttpModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forRoot([
            { path: "", component: HomeComponent},
            { path: "user", component: UserComponent},
            { path: "repos", component: RepositoriesComponent },
            { path: "repos/:owner/:name", component: RepositoryComponent },
            { path: "repos/:owner/:name/issues/:issue", component: IssueComponent },
            { path: "milestone/:owner/:name/:milestone", component: MilestoneComponent },
            { path: "notifications", component: NotificationsComponent }
        ])
    ]
})
class AppComponentModule { }



platformNativeScriptDynamic().bootstrapModule(AppComponentModule);
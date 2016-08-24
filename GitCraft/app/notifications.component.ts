import {Component} from "@angular/core";
import {GitHub, Repository, Organization, Milestone, Issue, Notification } from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router, ActivatedRoute} from "@angular/router";
import {BackgroundColorPipe, ColorPipe} from "./github.color.pipe";
import {Location} from '@angular/common';

const apigithubPrefix = "https://api.github.com/";

@Component({
    selector: "Notifications",
    templateUrl: "notifications.component.html",
    styleUrls: ["notifications.component.css"],
    pipes: [BackgroundColorPipe, ColorPipe]
})
export class NotificationsComponent {
    public notifications: Notification[];
    public loading: boolean = true;

    constructor(private github: GitHub, private router: Router, private route: ActivatedRoute, private location: Location) {
        console.log("Create NotificationsComponent");
    }

    public ngOnInit() {
        this.github.request("notifications").then(result => {
            this.notifications = result;
            this.loading = false;
        });
    }

    public onNotificationTap(args: ItemEventData) {
        let notification = this.notifications[args.index];
        console.log("Tapped on " + notification.subject.title);
        let url = notification.subject.url;
        if (url.substr(0, apigithubPrefix.length) === apigithubPrefix) {
            let urlTail = url.substr(apigithubPrefix.length).split("/");
            console.log("Navigate: [" + urlTail.join(", ") + "]");
            this.router.navigate(urlTail);
        }
    }
}

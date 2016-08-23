import {Component} from "@angular/core";
import {GitHub, Repository, Organization, Milestone, Issue, Notification } from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router, ActivatedRoute} from "@angular/router";
import {BackgroundColorPipe, ColorPipe} from "./github.color.pipe";
import {Location} from '@angular/common';

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

    ngOnInit() {
        this.github.request("notifications").then(result => {
            // console.log("Result: " + JSON.stringify(result));
            this.notifications = result;
            this.loading = false;
        });
    }
}

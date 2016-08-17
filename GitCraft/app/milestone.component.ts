import {Component} from "@angular/core";
import {GitHub, Repository, Organization, Milestone, Issue } from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router, ActivatedRoute} from "@angular/router";
import {BackgroundColorPipe, ColorPipe} from "./github.color.pipe";
@Component({
    selector: "Milestone",
    templateUrl: "milestone.component.html",
    styleUrls: ["milestone.component.css"],
    providers: [GitHub],
    pipes: [BackgroundColorPipe, ColorPipe]
})
export class MilestoneComponent {

    owner: string;
    name: string;
    number: number;

    issues: Issue[];

    constructor(private github: GitHub, private router: Router, private route: ActivatedRoute) {
        console.log("Create MilestoneComponent");
    }

    ngOnInit() {
        this.route.params
            .map(params => ({ owner: decodeURIComponent(params['owner']), name: decodeURIComponent(params['name']), id: decodeURIComponent(params['milestone']) }))
            .subscribe(params => {
                console.log("Owner: " + params.owner + ", Name: " + params.name);
                this.owner = params.owner;
                this.name = params.name;
                this.number = parseInt(params.id);
                this.github.request("repos", params.owner, params.name, "issues", { milestone: params.id, state: "all" }).then(
                    result => {
                        this.issues = result;
                    }
                );
            });
    }

    goBack() {
        this.router.navigate(["/"]);
    }
}

import {Component} from "@angular/core";
import {GitHubService, Repository, Organization, Milestone, Issue } from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router, ActivatedRoute} from "@angular/router";
import {BackgroundColorPipe, ColorPipe} from "./github.color.pipe";
import {Location} from '@angular/common';

@Component({
    selector: "Milestone",
    templateUrl: "milestone.component.html",
    styleUrls: ["milestone.component.css"]
})
export class MilestoneComponent {

    owner: string;
    name: string;
    number: number;

    issues: Issue[];

    milestone: Milestone;

    openIssues: Issue[];
    closedIssues: Issue[];

    // Only if authorized...
    myIssues: Issue[];

    constructor(private github: GitHubService, private router: Router, private route: ActivatedRoute, private location: Location) {
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

                this.github.request("repos", this.owner, this.name, "milestones", this.number).then(milestone => {
                    this.milestone = milestone;
                });
                
                this.github.request("repos", params.owner, params.name, "issues", { milestone: params.id, state: "all" }).then(
                    (result: Issue[]) => {
                        this.issues = result;
                        this.openIssues = result.filter(issue => issue.state === "open");
                        this.closedIssues = result.filter(issue => issue.state === "closed");

                        console.log(this.github);
                        console.log(this.github.authenticatedUser);
                        console.log(this.github.authenticatedUser.login);

                        if (this.github.authenticatedUser) {
                            console.log("Search for " + this.github.authenticatedUser.login);
                            this.myIssues = result.filter(issue => issue.assignees && issue.assignees.some(asignee => {
                                console.log(" - " + asignee.login);
                                return asignee.login === this.github.authenticatedUser.login;
                            }));
                        } else {
                            this.myIssues = null;
                        }
                    }
                );
            });
    }

    goBack() {
        this.location.back();
    }

    onOpenIssueTap(args) {
        this.onIssueTap(this.openIssues[args.index]);
    }

    onClosedIssueTap(args) {
        this.onIssueTap(this.closedIssues[args.index]);
    }

    onMyIssueTap(args) {
        this.onIssueTap(this.myIssues[args.index]);
    }

    onIssueTap(issue: Issue) {
        this.router.navigate(["/repos", encodeURIComponent(this.owner), encodeURIComponent(this.name), "issues", issue.number]);
    }
}

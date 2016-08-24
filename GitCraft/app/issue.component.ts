import {Component, OnInit, OnDestroy, NgZone, } from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {GitHub, Issue, Comment} from "./github.service";
import {BackgroundColorPipe, ColorPipe} from "./github.color.pipe";
import {Location} from '@angular/common';

@Component({
    selector: "Issue",
    templateUrl: "issue.component.html",
    styleUrls: ["issue.component.css"],
    pipes: [BackgroundColorPipe, ColorPipe]
})
export class IssueComponent implements OnInit {
    private owner: string;
    private name: string;
    private number: string;

    public issue: Issue;
    public comments: Comment[]; 

    constructor(public github: GitHub, public router: Router, private route: ActivatedRoute, private location: Location) {
        console.log("new IssueComponent");
    }

    public ngOnInit() {
        this.route.params
            .map(params => ({ owner: decodeURIComponent(params['owner']), name: decodeURIComponent(params['name']), number: decodeURIComponent(params['issue']) }))
            .subscribe(params => {
                this.owner = params.owner;
                this.name = params.name;
                this.number = params.number;
                console.log("Owner: " + this.owner + ", Name: " + this.name + ", Issue: " + this.number);

                this.github.request("repos", this.owner, this.name, "issues", this.number).then(result => {
                    this.issue = result;

                    this.github.request("repos", this.owner, this.name, "issues", this.number, "comments").then(result => {
                        this.comments = result;
                    });
                });
            });
    }
}
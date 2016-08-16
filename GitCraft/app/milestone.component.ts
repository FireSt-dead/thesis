import {Component} from "@angular/core";
import {GitHub, Repository, Organization, Milestone } from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
    selector: "Milestone",
    templateUrl: "milestone.component.html",
    styleUrls: ["milestone.component.css"],
    providers: [GitHub]
})
export class MilestoneComponent {

    owner: string;
    name: string;
    id: number;

    milestones: Milestone[];

    constructor(private github: GitHub, private router: Router, private route: ActivatedRoute) {
        console.log("Create MilestoneComponent");
    }

    ngOnInit() {
        // TODO: Fix the querry
        this.route.params
            .map(params => ({ owner: decodeURIComponent(params['owner']), name: decodeURIComponent(params['name']), id: decodeURIComponent(params['id']) }))
            .subscribe(params => {
                console.log("Owner: " + params.owner + ", Name: " + params.name);
                this.owner = params.owner;
                this.name = params.name;
                this.id = parseInt(params.id);
                this.github.request("repos", params.owner, params.name, "issues", { milestone: params.id }).then(
                    result => {
                        console.log("Issues: " + result + " " + result.length);
                    }
                );
            });
    }

    goBack() {
        this.router.navigate(["/"]);
    }
}

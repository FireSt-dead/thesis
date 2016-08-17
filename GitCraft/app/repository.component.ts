import {Component} from "@angular/core";
import {GitHub, Repository, Organization, Milestone } from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router, ActivatedRoute} from "@angular/router";
import {MilestoneComponent} from "./milestone.component";
import {Location} from '@angular/common';

@Component({
    selector: "Repository",
    templateUrl: "repository.component.html",
    styleUrls: ["repository.component.css"],
    providers: [GitHub]
})
export class RepositoryComponent {

    owner: string;
    name: string;

    milestones: Milestone[];

    constructor(private github: GitHub, private router: Router, private route: ActivatedRoute, private location: Location) {
        console.log("Create RepositoriesComponent");
    }

    ngOnInit() {
        this.route.params
            .map(params => ({ owner: decodeURIComponent(params['owner']), name: decodeURIComponent(params['name']) }))
            .subscribe(params => {
                console.log("Owner: " + params.owner + ", Name: " + params.name);
                this.owner = params.owner;
                this.name = params.name;
                this.github.request("repos", params.owner, params.name).then(
                    result => {
                        // TODO: Show in collapsible toolbar
                        console.log("github request repos: " + result + " " + result.full_name);
                    }
                );
                this.github.request("repos", params.owner, params.name, "milestones", { state: "all" }).then(result => this.milestones = result);
            });
    }

    goBack() {
        this.location.back();
    }

    public onMilestoneTap(args: ItemEventData) {
        let milestone = this.milestones[args.index];
        console.log("Tapped on " + milestone.title);
        this.router.navigate(["/milestone", encodeURIComponent(this.owner), encodeURIComponent(this.name), encodeURIComponent(milestone.number.toString()) ]);
    }
}

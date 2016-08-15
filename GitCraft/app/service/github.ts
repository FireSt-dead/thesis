import { Injectable } from '@angular/core';
import { Http, RequestMethod } from '@angular/http';

@Injectable()
export class GitHub {
    constructor(private http: Http) {}

    /**
     * Get the repositories for an organization by name.
     */
    request(orgs: "orgs", name: string, repos: "repos"): Repository[];

    request(... args: any[]): any[];
    request(... args: string[]): any {
        return this.http.get("https://api.github.com/" + args.join("/"))
            .subscribe(
                repoes => {
                    console.log("Repos: " + repoes);
                    (repoes.json() as Repository[]).forEach(repo => {
                        console.log(" - " + repo.name);
                    })
                },
                error => console.log("Error: " + error)
            );
    }
}

export interface Organization {
    name: string;
}

export interface Repository {
    name: string;
}
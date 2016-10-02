import { Injectable, NgZone } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Http, RequestMethod } from '@angular/http';
import {Headers} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import * as utils from "utils/utils";

import * as application from "application";

@Injectable()
export class GitHubService {

    private static access_token: string;
    private static instance: GitHubService;
    private static OAuthRequestURL: string = "https://github.com/login/oauth/authorize?client_id=ddad3314e37c5efbf57f&allow_signup=true&scope=repo,user";

    public authenticatedUser: User;

    constructor(private http: Http, public zone: NgZone) {
        console.log("New GitHub instance!");
        if (GitHubService.instance) {
            console.log("GitHubService can be instantiated only once.");
            return GitHubService.instance;
        }
        GitHubService.instance = this;

        // TODO: restoreToken and request user on success...
    }

    @Output() authorizedChange = new EventEmitter();

    public get authorized(): boolean { return !!GitHubService.access_token; }

    /**
     * Get the repositories for an organization by name.
     * Example query: https://api.github.com/search/repositories?q=native
     */
    request(orgs: "orgs", name: string, repos: "repos"): Promise<Repository[]>;

    /**
     * Search for repositories.
     * Example query: https://api.github.com/search/repositories?q=native
     */
    request(search: "search", what: "repositories", querry: SearchQuerry): Promise<SearchResult<Repository>>;

    /**
     * Get repository by owner and repository names.
     */
    request(repos: "repos", owner: string, repo: string): Promise<Repository>;

    /**
     * Get milestones for repository by owner and repository names.
     * Example query: https://api.github.com/repos/NativeScript/NativeScript/milestones
     */
    request(repos: "repos", owner: string, repo: string, milestones: "milestones", querry?: MilestonesQuery): Promise<Milestone[]>;

    request(user: "user", repos: "repos", UserReposQuery): Promise<Repository[]>;

    /**
     * Get the authenticated user details.
     */
    request(user: "user"): Promise<User>;

    request(notifications: "notifications"): Promise<Notification[]>;

    request(repos: "repos", owner: string, repo: string, issues: "issues", query?: IssuesQuery): Promise<Issue[]>;
    request(repos: "repos", owner: string, repo: string, issues: "issues", number: string): Promise<Issue>;
    request(repos: "repos", owner: string, repo: string, issues: "issues", number: string, comments: "comments"): Promise<Comment[]>;

    request(... args: any[]): any;
    request(... args: (string | {})[]): any {
        let querryUri = "https://api.github.com/";
        querryUri += args.filter(s => typeof s === "string").join("/");
        let last = args[args.length - 1];
        let params = typeof last === "object" ? last : undefined;
        if (params || GitHubService.access_token) {
            querryUri += "?";
            let separate = false;
            for(let key in params) {
                // TODO: Url escape
                querryUri += (separate ? "&" : "") + key + "=" + params[key];
                separate = true;
            }
            if (GitHubService.access_token) {
                querryUri += (separate ? "&" : "") + "access_token" + "=" + GitHubService.access_token;
                separate = true;
            }
        }
        console.log("Querry: " + querryUri);
        return this.http.get(querryUri, {
                // Enables experimental reactions.
                headers: new Headers({ Accept: "application/vnd.github.squirrel-girl-preview" })
            })
            .toPromise()
            .then(response => Promise.resolve(response.json()));
    }

    public requestOAuth() {
        // TODO: Create **state** and store it for safe keeping untill exchangeForAccessToken is called.
        utils.openUrl(GitHubService.OAuthRequestURL);
    }

    /**
     * iOS scheme URL entry point.
     */
    public static registerForURLIntent() {
        let handler = args => {
            console.log("activityResumed!");
            let intent = args.activity.getIntent();
            let data = intent.getData();
            if (data) {
                let scheme = data.getScheme();
                let host = data.getHost();
                if (scheme === "gitcraft" && host === "oauth-cb") {
                    let code = data.getQueryParameter("code");
                    let state = data.getQueryParameter("state");
                    GitHubService.exchangeForAccessToken({ code, state });
                }
            }
        };
        application.android.on("activityResumed", handler);
    }

    /**
     * Android scheme URL entry point.
     */
    public static applicationHandleOpenURL(application, url) {
        let urlComponents = NSURLComponents.componentsWithURLResolvingAgainstBaseURL(url, false);
        let items = urlComponents.queryItems;

        let code: string = null;
        let state: string = null;
        console.log("Items: " + items);
        items.enumerateObjectsUsingBlock(item => {
            console.log("   query params: " + item);
            if (item.name == "code" && !code) {
                code = item.value;
            } else if (item.name == "state" && !state) {
                state = item.value;
            }
        });

        GitHubService.exchangeForAccessToken({ code, state });
        return true;
    }

    static exchangeForAccessToken(params: { code: string, state: string }) {
        GitHubService.instance.exchangeForAccessToken(params);
    }

    private exchangeForAccessToken(params: { code: string, state: string }) {
        console.log("exchangeForAccessToken: " + params.code + " " + params.state);
        // TODO: Verify **state**
        console.log("exchangeForAccessToken " + params.code + " " + params.state);
        let url = "https://github.com/login/oauth/access_token";
        url += "?client_id=ddad3314e37c5efbf57f";
        url += "&client_secret=304bc86ebc19fa0de7dcdbf8bb9afdbbad45d639";
        url += "&code=" + params.code;

        this.http.post(url, "", {
            headers: new Headers({ Accept: "application/json" })
        }).toPromise().then(result => {
            // TODO: What if result.status !== 200
            console.log("Result from OAuth:");
            console.log(result.status);
            let resultJson: {
                access_token: string,
                token_type:"bearer",
                scope: string,
            } = result.json();
            console.log("result " + JSON.stringify(resultJson));

            // TODO: Revoke existing tokens and persist the access_token for later use (even after app restart)...
            this.zone.run(() => {
                GitHubService.access_token = resultJson.access_token;
                this.authorizedChange.emit({});
                console.log("in NgZone " + this.zone);
                this.requestUser();

                // Save the token...
                this.persistToken(GitHubService.access_token);
            });
        }).catch(error => {
            console.log("OAuth error: " + error);
        });
    }

    private persistToken(token: string) {
        // iOS Key chain...
        // // Try save in keychain!
        // console.log("Try save in keychain");
        // declare var NSString, NSUTF8StringEncoding,
        //     SecItemCopyMatching, SecItemAdd,
        //     kSecClassGenericPassword,
        //     kSecClass, kSecMatchLimit, kSecMatchLimitOne,
        //     kSecAttrGeneric, kSecReturnAttributes, kCFBooleanTrue,
        //   
        //  kSecValueData,
        //     noErr, errSecItemNotFound,
        //     interop;

        // let keychainItemId = NSString.stringWithString("org.nativescript.GitCraft:OAuth2.token").dataUsingEncoding(NSUTF8StringEncoding);
        // let query = {
        //     [kSecClass]: kSecClassGenericPassword,
        //     [kSecMatchLimit]: kSecMatchLimitOne,
        //     [kSecAttrGeneric]: keychainItemId,
        //     [kSecReturnAttributes]: kCFBooleanTrue
        // }
        // let out = new interop.Reference();
        // console.log("Query keychain");
        // let keychainError = SecItemCopyMatching(query, out);
        // console.log("Error: " + keychainError);
        // console.log("Result ref: " + out);
        // console.log("Result value: " + out.value);

        // if (keychainError === noErr) {
        //     console.log("Success!");
        // } else if (keychainError === errSecItemNotFound) {
        //     console.log("Not found.");
        //     let addError = SecItemAdd({
        //         [kSecAttrGeneric]: keychainItemId,
        //         [kSecClass]: kSecClassGenericPassword,
        //         [kSecValueData]: NSString.stringWithString("ASDSADASD").dataUsingEncoding(NSUTF8StringEncoding)
        //     }, null);
        //     console.log("SecItemAdd error code: " + addError);
        // } else {
        //     console.log("Unknown error.");
        // }
    }

    private requestUser() {
        this.request("user").then(user => {
            this.zone.run(() => {
                this.authenticatedUser = user;
            });
        })
    }
}

export interface Organization {
    name: string;
}

export interface Repository {
    name: string;
    full_name: string;
    forks: number;
    open_issues: number;
    watchers: number;
    private: boolean;
    owner: Owner;
}

export interface Owner {
    login: string;
    avatar_url: "";
    gavatar_id: string;
    type: "Organization" | "User";
}

export type SearchSort = "stars" | "forks" | "updated";
export type Order = "asc" | "desc";

export interface SearchQuerry {
    q: string;
    sort?: SearchSort;
    order?: Order;
}
export interface SearchResult<T> {
    total_count: number;
    incomplete_results: boolean;
    items: Repository[];
}

export interface MilestonesQuery {
    state?: "open" | "closed" | "all";
    sort?: "due_on" | "completeness";
    direction?: "asc" | "desc";
}

export interface Milestone {
    title: string;
    id: number;
    number: number;
    description: string;

    creator: Owner;

    open_issues: number;
    closed_issues: number;
    state: "open" | "closed";

    created_at: string;
    updated_at: string;
    due_on: string;
    closed_at: string;
}

interface IssuesQuery {
    milestone?: number | "none" | "*";
    state?: "all" | "open" | "closed";
    assignee?: string | "*" | "none";
    creator?: string;
    mentioned?: string;

    /**
     * A list of comma separated label names. Example: bug,ui,@high
     */
    labels?: string;

    /**
     * What to sort results by. Can be either created, updated, comments. Default: created
     */
    sort?: string;

    direction?: "asc" | "desc";

    /**
     * Only issues updated at or after this time are returned. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    since?: string;
}

export interface Issue {
    id: number;
    number: number;
    title: string;
    user: Owner;
    labels: Label[];
    state: "open" | "closed";
    locked: boolean;
    assignee: Owner;
    assignees: Owner[];
    milestone: Milestone;
    comments: number;

    created_at: string;
    updated_at: string;
    closed_at: string;
    body: string;

    reactions?: {
        url: string;
        total_count: number;
        "+1": number;
        "-1": number;
        laugh: number;
        hooray: number;
        confused: number;
        heart: number;
    }
}

export interface Label {
    name: string;
    color: string;
}

export interface UserReposQuery {
    visibility?: "all" | "public" | "private";
    
    /**
     * Comma-separated list of values.
     * Default: "owner,collaborator,organization_member".
     */
    affiliation?: "owner" | "collaborator" | "organization_member" | string;
    type: "all" | "owner" | "public" | "private" | "member";
    sort: "created" | "updated" | "pushed" | "full_name";
    direction: "asc" | "desc";
}

export interface User extends Owner {
    location: string;
    email: string;
    bio: string;
    name: string;
}

export interface Notification {
    id: string;
    repository: {
        id: string;
        name: string;
        full_name: string;
        description: string;
        private: boolean;
    };
    subject: {
        title: string;
        url: string;
        type: "Issue"
    };
    unread: boolean;

    updated_at: string;
    last_read_at: string;

    reason: "subscribed" | "manual" | "author" | "mention" | "team_mention" | "state_change" | "assign";
}

export interface Comment {
    id: number;
    user: {
        login: string;
        id: number;
        avatar_url: string;
    };
    created_at: string;
    updated_at: string;
    body: string;
}
import gitapi from "../api-github/api-github";

declare var describe, it, require;

var fs = require('fs');
var { username, password } = <{ username: string, password: string }>JSON.parse(fs.readFileSync("secret.json"));

describe("api.github", function() {
    this.timeout(100000);
    it("integration", () => gitapi("user", { username, password }).then(user =>
        Promise.all([
            gitapi("users", user.login, "starred"),
            gitapi("users", user.login, "subscriptions"),
            gitapi("users", user.login, "repos"),
            gitapi("users", user.login, "orgs")
        ]).then(([starred, subscriptions, repos, orgs]) => {
            console.log("User: " + user.login);
            console.log(" - starred:");
            starred.forEach(repo => console.log("   ★ " + repo.full_name));
            console.log(" - subscribed:");
            subscriptions.forEach(repo => console.log("   - " + repo.full_name));
            console.log(" - repos:");
            repos.forEach(repo => console.log("   - " + repo.full_name));
            console.log(" - member of org:");
            orgs.forEach(org => {
                console.log("   - " + org.login);
                console.log("     " + org.description);
            });
        }))
    );
    it("user login", function() {
        return gitapi("user", { username, password }).then(user => {
            // console.log("User: " + user.login);
        });
    })
    it("issues", function(done) {
        gitapi("repos", "NativeScript", "NativeScript", "issues", { milestone: 17, state: "all" }).then(issues => {
            issues.forEach(issue => {
                //console.log(" - " + issue.title);
            });
            done();
        }).catch(done);
    });
    it("milestone", function(done) {
        gitapi("repos", "NativeScript", "NativeScript", "milestones", { state: "all" }).then(milestones => {
            milestones.forEach(milestone => {
                //console.log(" - " + milestone.title + ", issues: " + milestone.open_issues + "/" + milestone.closed_issues + " (" + milestone.state + ")");
            });
            done();
        }).catch(done);
    });
    it("orgs <name> repos", function(done) {
        gitapi("orgs", "NativeScript", "repos").then(repos => {
            repos.forEach(repo => {
                //console.log(" - " + repo.full_name + " ★" + repo.stargazers_count /* + " 👁" + repo.subscribers_count */);
            });
            done();
        }).catch(done);
    });
});
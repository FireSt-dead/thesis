"use strict";
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var GitHub = (function () {
    function GitHub(http) {
        this.http = http;
    }
    GitHub.prototype.request = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.http.get("https://api.github.com/" + args.join("/"))
            .subscribe(function (repoes) {
            console.log("Repos: " + repoes);
            repoes.json().forEach(function (repo) {
                console.log(" - " + repo.name);
            });
        }, function (error) { return console.log("Error: " + error); });
    };
    GitHub = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], GitHub);
    return GitHub;
}());
exports.GitHub = GitHub;
//# sourceMappingURL=github.js.map
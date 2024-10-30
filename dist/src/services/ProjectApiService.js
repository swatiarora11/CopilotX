"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProjectDbService_1 = __importDefault(require("./ProjectDbService"));
const AssignmentDbService_1 = __importDefault(require("./AssignmentDbService"));
const ConsultantDbService_1 = __importDefault(require("./ConsultantDbService"));
const ConsultantApiService_1 = __importDefault(require("./ConsultantApiService"));
const Utilities_1 = require("./Utilities");
class ProjectApiService {
    getApiProjectById(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield ProjectDbService_1.default.getProjectById(projectId);
            let assignments = yield AssignmentDbService_1.default.getAssignments();
            const result = yield this.getApiProject(project, assignments);
            return result;
        });
    }
    getApiProjects(projectOrClientName, consultantName) {
        return __awaiter(this, void 0, void 0, function* () {
            let projects = yield ProjectDbService_1.default.getProjects();
            let assignments = yield AssignmentDbService_1.default.getAssignments();
            // Filter on base properties
            if (projectOrClientName) {
                projects = projects.filter((p) => {
                    var _a, _b;
                    const name = (_a = p.name) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    const clientName = (_b = p.clientName) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                    return name.includes(projectOrClientName.toLowerCase()) || clientName.includes(projectOrClientName.toLowerCase());
                });
            }
            //remove duplicates
            projects = projects.filter((project, index, self) => index === self.findIndex((p) => (p.id === project.id)));
            // Augment the base properties with assignment information
            let result = yield Promise.all(projects.map((p) => this.getApiProject(p, assignments)));
            // Filter on augmented properties
            if (result && consultantName) {
                result = result.filter((p) => {
                    const name = consultantName.toLowerCase();
                    return p.consultants.find((n) => n.consultantName.toLowerCase().includes(name));
                });
            }
            ;
            return result;
        });
    }
    // Augment a project to get an ApiProject
    getApiProject(project, assignments) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = project;
            assignments = assignments.filter((a) => a.projectId === project.id);
            result.consultants = [];
            result.forecastThisMonth = 0;
            result.forecastNextMonth = 0;
            result.deliveredLastMonth = 0;
            result.deliveredThisMonth = 0;
            for (let assignment of assignments) {
                const consultant = yield ConsultantDbService_1.default.getConsultantById(assignment.consultantId);
                const { lastMonthHours: forecastLastMonth, thisMonthHours: forecastThisMonth, nextMonthHours: forecastNextMonth } = this.findHours(assignment.forecast);
                const { lastMonthHours: deliveredLastMonth, thisMonthHours: deliveredThisMonth, nextMonthHours: deliveredNextMonth } = this.findHours(assignment.delivered);
                result.consultants.push({
                    consultantName: consultant.name,
                    consultantLocation: consultant.location,
                    role: assignment.role,
                    forecastThisMonth: forecastThisMonth,
                    forecastNextMonth: forecastNextMonth,
                    deliveredLastMonth: deliveredLastMonth,
                    deliveredThisMonth: deliveredThisMonth
                });
                result.forecastThisMonth += forecastThisMonth;
                result.forecastNextMonth += forecastNextMonth;
                result.deliveredLastMonth += deliveredLastMonth;
                result.deliveredThisMonth += deliveredThisMonth;
            }
            return result;
        });
    }
    // Extract this and next month's hours from an array of HoursEntry
    findHours(hours) {
        var _a, _b, _c;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        const nextMonth = thisMonth === 11 ? 0 : thisMonth + 1;
        const nextYear = thisMonth === 11 ? thisYear + 1 : thisYear;
        const result = {
            lastMonthHours: ((_a = hours.find((h) => h.month === lastMonth + 1 && h.year === lastYear)) === null || _a === void 0 ? void 0 : _a.hours) || 0,
            thisMonthHours: ((_b = hours.find((h) => h.month === thisMonth + 1 && h.year === thisYear)) === null || _b === void 0 ? void 0 : _b.hours) || 0,
            nextMonthHours: ((_c = hours.find((h) => h.month === nextMonth + 1 && h.year === nextYear)) === null || _c === void 0 ? void 0 : _c.hours) || 0
        };
        return result;
    }
    addConsultantToProject(projectName, consultantName, role, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            let projects = yield this.getApiProjects(projectName, "");
            let consultants = yield ConsultantApiService_1.default.getApiConsultants(consultantName, "", "", "", "", "");
            if (projects.length === 0) {
                throw new Utilities_1.HttpError(404, `Project not found: ${projectName}`);
            }
            else if (projects.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple projects found with the name: ${projectName}`);
            }
            else if (consultants.length === 0) {
                throw new Utilities_1.HttpError(404, `Consultant not found: ${consultantName}`);
            }
            else if (consultants.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple consultants found with the name: ${consultantName}`);
            }
            const project = projects[0];
            const consultant = consultants[0];
            // Always charge to the current month
            const remainingForecast = yield AssignmentDbService_1.default.addConsultantToProject(project.id, consultant.id, role, hours);
            const message = `Added consultant ${consultant.name} to ${project.clientName} on project "${project.name}" with ${remainingForecast} hours forecast this month.`;
            return {
                clientName: project.clientName,
                projectName: project.name,
                consultantName: consultants[0].name,
                remainingForecast,
                message
            };
        });
    }
}
exports.default = new ProjectApiService();
//# sourceMappingURL=ProjectApiService.js.map
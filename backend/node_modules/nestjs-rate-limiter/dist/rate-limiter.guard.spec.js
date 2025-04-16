"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rate_limiter_decorator_1 = require("./rate-limiter.decorator");
describe('RateLimit', () => {
    it('should validate that RateLimit decorator exists', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(rate_limiter_decorator_1.RateLimit).toBeDefined();
    }));
    it('should verify RateLimit Method decorator can be created with empty options', () => __awaiter(void 0, void 0, void 0, function* () {
        const options = {};
        const decorator = rate_limiter_decorator_1.RateLimit(options);
        expect(decorator).toBeDefined();
    }));
    it('should verify RateLimit can decorate a method and be called', () => __awaiter(void 0, void 0, void 0, function* () {
        const options = {};
        const testFn = jest.fn();
        class TestController {
            run() {
                testFn();
            }
        }
        __decorate([
            rate_limiter_decorator_1.RateLimit(options),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], TestController.prototype, "run", null);
        const controller = new TestController();
        controller.run();
        expect(testFn).toHaveBeenCalled();
    }));
});

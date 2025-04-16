export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class SecurityQuestionDto {
    question: string;
    answer: string;
}
export declare class SecurityQuestionsDto {
    questions: SecurityQuestionDto[];
}
export declare class LoginHistoryQueryDto {
    limit?: number;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const user_settings_dto_1 = require("../dto/user-settings.dto");
describe('AuthService - Extended User Settings', () => {
    let service;
    let userId;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        const user = await service.register({
            firstName: 'Test',
            lastName: 'User',
            email: `test-${Date.now()}@example.com`,
            password: 'Password123!',
        });
        userId = user.id;
    });
    describe('Notification Frequency Settings', () => {
        it('should update notification frequencies', async () => {
            const frequencies = {
                email: user_settings_dto_1.NotificationFrequency.WEEKLY,
                push: user_settings_dto_1.NotificationFrequency.HOURLY,
                sms: user_settings_dto_1.NotificationFrequency.NEVER
            };
            const result = await service.updateNotificationFrequency(userId, frequencies);
            expect(result.message).toBe('Notification frequency updated successfully');
            expect(result.frequencies).toEqual(frequencies);
        });
        it('should handle invalid frequency values', async () => {
            const frequencies = {
                email: 'invalid',
                push: user_settings_dto_1.NotificationFrequency.HOURLY,
                sms: user_settings_dto_1.NotificationFrequency.NEVER
            };
            const result = await service.updateNotificationFrequency(userId, frequencies);
            expect(result.frequencies.email).not.toBe('invalid');
            expect(result.frequencies.push).toBe(user_settings_dto_1.NotificationFrequency.HOURLY);
            expect(result.frequencies.sms).toBe(user_settings_dto_1.NotificationFrequency.NEVER);
        });
        it('should throw error for non-existent user', async () => {
            const frequencies = {
                email: user_settings_dto_1.NotificationFrequency.WEEKLY,
                push: user_settings_dto_1.NotificationFrequency.HOURLY,
                sms: user_settings_dto_1.NotificationFrequency.NEVER
            };
            await expect(service.updateNotificationFrequency('non-existent-id', frequencies)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Notification Delivery', () => {
        it('should send test email notification', async () => {
            const result = await service.sendTestNotification(userId, 'email');
            expect(result.message).toBe('Test email notification sent successfully');
            expect(result.notification).toBeDefined();
            expect(result.notification.channel).toBe('email');
            expect(result.notification.userId).toBe(userId);
            expect(result.notification.status).toBe('delivered');
        });
        it('should send test push notification', async () => {
            const result = await service.sendTestNotification(userId, 'push');
            expect(result.message).toBe('Test push notification sent successfully');
            expect(result.notification.channel).toBe('push');
        });
        it('should send test SMS notification', async () => {
            const result = await service.sendTestNotification(userId, 'sms');
            expect(result.message).toBe('Test sms notification sent successfully');
            expect(result.notification.channel).toBe('sms');
        });
        it('should throw error for invalid notification channel', async () => {
            await expect(service.sendTestNotification(userId, 'invalid')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error for non-existent user', async () => {
            await expect(service.sendTestNotification('non-existent-id', 'email')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Dashboard Settings', () => {
        it('should update dashboard layout', async () => {
            const layout = user_settings_dto_1.DashboardLayout.LIST;
            const result = await service.updateDashboardLayout(userId, layout);
            expect(result.message).toBe('Dashboard layout updated successfully');
            expect(result.layout).toBe(layout);
        });
        it('should update dashboard widgets', async () => {
            const widgets = [
                {
                    id: '1',
                    type: user_settings_dto_1.WidgetType.ACTIVITY,
                    title: 'Recent Activity',
                    position: { x: 0, y: 0, width: 2, height: 2 },
                    config: {}
                },
                {
                    id: '2',
                    type: user_settings_dto_1.WidgetType.NOTIFICATIONS,
                    title: 'My Notifications',
                    position: { x: 2, y: 0, width: 1, height: 1 },
                    config: {}
                }
            ];
            const result = await service.updateDashboardWidgets(userId, widgets);
            expect(result.message).toBe('Dashboard widgets updated successfully');
            expect(result.widgets).toEqual(widgets);
            expect(result.widgets.length).toBe(2);
        });
        it('should add a dashboard widget', async () => {
            const widget = {
                type: user_settings_dto_1.WidgetType.CHART,
                title: 'Monthly Overview',
                position: { x: 0, y: 0, width: 3, height: 2 },
                config: { dataSource: 'monthly-stats' }
            };
            const result = await service.addDashboardWidget(userId, widget);
            expect(result.message).toBe('Widget added to dashboard successfully');
            expect(result.widget.type).toBe(widget.type);
            expect(result.widget.title).toBe(widget.title);
            expect(result.widget.id).toBeDefined();
        });
        it('should remove a dashboard widget', async () => {
            const widget = {
                type: user_settings_dto_1.WidgetType.TASKS,
                title: 'My Tasks',
                position: { x: 0, y: 0, width: 2, height: 1 },
                config: {}
            };
            const addResult = await service.addDashboardWidget(userId, widget);
            const widgetId = addResult.widget.id;
            const removeResult = await service.removeDashboardWidget(userId, widgetId);
            expect(removeResult.message).toBe('Widget removed from dashboard successfully');
            expect(removeResult.widgetId).toBe(widgetId);
        });
        it('should throw error when removing non-existent widget', async () => {
            await expect(service.removeDashboardWidget(userId, 'non-existent-widget-id')).rejects.toThrow(common_1.NotFoundException);
        });
        it('should save complete dashboard configuration', async () => {
            const configuration = {
                layout: user_settings_dto_1.DashboardLayout.COMPACT,
                widgets: [
                    {
                        id: '1',
                        type: user_settings_dto_1.WidgetType.CALENDAR,
                        title: 'My Calendar',
                        position: { x: 0, y: 0, width: 2, height: 2 },
                        config: { showWeekends: true }
                    },
                    {
                        id: '2',
                        type: user_settings_dto_1.WidgetType.NEWS,
                        title: 'Latest News',
                        position: { x: 2, y: 0, width: 1, height: 2 },
                        config: { sources: ['tech', 'business'] }
                    }
                ]
            };
            const result = await service.saveDashboardConfiguration(userId, configuration);
            expect(result.message).toBe('Dashboard configuration saved successfully');
            expect(result.dashboard.layout).toBe(configuration.layout);
            expect(result.dashboard.widgets).toEqual(configuration.widgets);
        });
        it('should validate widget positions when saving dashboard configuration', async () => {
            const invalidConfiguration = {
                layout: user_settings_dto_1.DashboardLayout.GRID,
                widgets: [
                    {
                        id: '1',
                        type: user_settings_dto_1.WidgetType.ACTIVITY,
                        title: 'Recent Activity',
                        position: { x: -1, y: 0, width: 2, height: 2 },
                        config: {}
                    }
                ]
            };
            await expect(service.saveDashboardConfiguration(userId, invalidConfiguration)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error for non-existent user', async () => {
            await expect(service.updateDashboardLayout('non-existent-id', user_settings_dto_1.DashboardLayout.LIST)).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=user-settings-extended.spec.js.map
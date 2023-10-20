"use strict";

import { expect, use } from "chai";
import chaiBytes from "chai-bytes";
import "mocha";
import {
	GW_ACTIVATION_LOG_UPDATED_NTF,
	GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF,
	IGW_FRAME_RCV_CTOR,
} from "../../src";

use(chaiBytes);

type notificationListEntryType = {
	NotificationClass: IGW_FRAME_RCV_CTOR;
	NotificationBytes: number[];
};

const simpleNotifications: notificationListEntryType[] = [
	{ NotificationClass: GW_GET_ALL_NODES_INFORMATION_FINISHED_NTF, NotificationBytes: [0x03, 0x02, 0x05] },
	{ NotificationClass: GW_ACTIVATION_LOG_UPDATED_NTF, NotificationBytes: [0x03, 0x05, 0x06] },
];

describe("KLF200-API", function () {
	describe("Simple Notifications", function () {
		for (const notificationTestCase of simpleNotifications) {
			describe(notificationTestCase.NotificationClass.name, function () {
				it("should create the class without error", function () {
					expect(
						() =>
							new notificationTestCase.NotificationClass(
								Buffer.from(notificationTestCase.NotificationBytes),
							),
					).not.to.throw();
				});
			});
		}
	});
});

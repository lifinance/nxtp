import { SinonStub, stub } from "sinon";

import { TEST_REPORT } from "../utils";
import { alertViaTelegram } from "../../src/alert";
import * as Mockable from "../../src/mockable";

import { expect } from "@connext/nxtp-utils";

describe("Watcher Adapter: telegram", () => {
  let telegramApiKey = "test-api-key";
  let telegramChatId = "@test";

  beforeEach(() => {});

  describe("#alertViaTelegram", () => {
    beforeEach(() => {});

    it("should throw if chatId or apiKey is invalid", async () => {
      await expect(alertViaTelegram(TEST_REPORT, telegramApiKey, undefined)).to.be.rejectedWith(
        "alertViaTelegram: Telegram alert config is invalid!",
      );

      await expect(alertViaTelegram(TEST_REPORT, undefined, telegramChatId)).to.be.rejectedWith(
        "alertViaTelegram: Telegram alert config is invalid!",
      );
    });

    it("should success if config is valid", async () => {
      let axiosPostStub: SinonStub;
      axiosPostStub = stub(Mockable, "axiosPost").resolves({ code: 200, data: "ok" });

      await expect(alertViaTelegram(TEST_REPORT, telegramApiKey, telegramChatId)).to.not.rejected;
      expect(axiosPostStub.callCount).to.be.eq(1);

      axiosPostStub.restore();
    });
  });
});

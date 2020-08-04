const { testMock } = require("./adapter.js");

jest.mock("./view.js", () => {return { updateView: () => {}}});

test("mocks updateView", () => {
	expect(() => testMock()).not.toThrow();
});

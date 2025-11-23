import { InvalidAvatarTypeError } from "src/core/errors/errors-user-management/invalid-avatar-type";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { FakeUploader } from "test/storage/fake-uploader";
import { UploadAndCreateUserAvatarUseCase } from "./upload-and-create-user-avatar";

let fakeUploader: FakeUploader;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;
let sut: UploadAndCreateUserAvatarUseCase;

describe("Upload and create user avatar", () => {
  beforeEach(() => {
    inMemoryAvatarsRepository = new InMemoryAvatarsRepository();
    fakeUploader = new FakeUploader();

    sut = new UploadAndCreateUserAvatarUseCase(
      inMemoryAvatarsRepository,
      fakeUploader,
    );
  });

  it("should be able to upload and create user avatar", async () => {
    const result = await sut.execute({
      fileName: "avatar.png",
      fileType: "image/png",
      body: Buffer.from("test"),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryAvatarsRepository.items[0]).toEqual(
        result.value.userAvatar,
      );
    }
    expect(fakeUploader.uploads).toHaveLength(1);
    expect(fakeUploader.uploads[0].fileName).toBe("avatar.png");
  });

  it("should not be able to upload an avatar with invalid file type", async () => {
    const result = await sut.execute({
      fileName: "avatar.png",
      fileType: "audio/mpeg",
      body: Buffer.from("test"),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidAvatarTypeError);
      expect(result.value.message).toBe("Invalid file type");
    }
  });
});

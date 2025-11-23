import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { FakeDownloader } from "test/storage/fake-downloader";
import { FakeUploader } from "test/storage/fake-uploader";
import { UserAvatar } from "../../../enterprise/entities/user-avatar";
import { DownloadUserAvatarByIdUseCase } from "./download-user-avatar";

let inMemoryAvatarsRepository: InMemoryAvatarsRepository;
let fakeDownloader: FakeDownloader;
let fakeUploader: FakeUploader;

let sut: DownloadUserAvatarByIdUseCase;

describe("Download user avatar", () => {
  beforeEach(() => {
    inMemoryAvatarsRepository = new InMemoryAvatarsRepository();
    fakeUploader = new FakeUploader();
    fakeDownloader = new FakeDownloader(fakeUploader);

    sut = new DownloadUserAvatarByIdUseCase(
      inMemoryAvatarsRepository,
      fakeDownloader,
    );
  });

  it("should be able to download a user avatar", async () => {
    const userAvatar = UserAvatar.create({
      title: "avatar.png",
      url: "http://localhost:3000/avatar.png",
    });
    fakeUploader.uploads.push({
      fileName: userAvatar.title,
      url: userAvatar.url,
    });
    await inMemoryAvatarsRepository.createMany([userAvatar]);

    const result = await sut.execute({
      avatarId: userAvatar.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      userAvatar,
      file: expect.objectContaining({
        fileName: "avatar.png",
        fileType: "image/png",
        body: Buffer.from(`Fake content for ${userAvatar.title}`),
      }),
    });
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        url: "http://localhost:3000/avatar.png",
      }),
    );
  });

  it("should not be able to download avatar with a non existing id", async () => {
    const result = await sut.execute({
      avatarId: "non-existing-id",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Avatar's id was not found");
    }
  });

  it("should not be able to download a avatar if url was found", async () => {
    const userAvatar = UserAvatar.create({
      title: "avatar.png",
      url: "http://localhost:3000/avatar.png",
    });
    fakeUploader.uploads.push({
      fileName: userAvatar.title,
      url: "http://localhost:3000/avatar-avatar.png",
    });
    await inMemoryAvatarsRepository.createMany([userAvatar]);

    const result = await sut.execute({
      avatarId: userAvatar.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("File was not found on the storage");
    }
  });
});

import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async create() {
    await this.prismaService.user.create({
      data: {
        email: 'test@example.com',
        fullname: 'test',
        password: await hash('test', 10),
        username: 'test',
      },
    });
  }
  async delete() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  cookieParser(cookieString: any) {
    // Return an empty object if cookieString
    // is empty
    if (cookieString === '') return {};

    // Get each individual key-value pairs
    // from the cookie string
    // This returns a new array
    let pairs = cookieString.split(';');

    // Separate keys from values in each pair string
    // Returns a new array which looks like
    // [[key1,value1], [key2,value2], ...]
    let splittedPairs = pairs.map((cookie) => cookie.split('='));

    // Create an object with all key-value pairs
    const cookieObj = splittedPairs.reduce(function (obj, cookie) {
      // cookie[0] is the key of cookie
      // cookie[1] is the value of the cookie
      // decodeURIComponent() decodes the cookie
      // string, to handle cookies with special
      // characters, e.g. '$'.
      // string.trim() trims the blank spaces
      // auround the key and value.
      obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(
        cookie[1].trim(),
      );

      return obj;
    }, {});

    return cookieObj;
  }
}

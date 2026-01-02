import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {INestApplication} from "@nestjs/common";

export default function(app: INestApplication) {
    const options = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('All application endpoints described here')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('documentation', app, document);
}

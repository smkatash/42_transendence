import { Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getRootRoute(){
        return 'hi there';
    }

    @Get('/hello')
    getHelloRoute(){
        return 'hello there';
    }

    @Get('/bye')
    getByeRoute(){
        return 'bye there';
    }
}
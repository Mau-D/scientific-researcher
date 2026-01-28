import { Controller, Get, Query } from '@nestjs/common';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Get()
  findAll(@Query('query') query:string) {
    console.log('KeywordsController - findAll query:', query);
    // return ['artificial Intelligence', 'YO', 'come on']
    return  this.keywordsService.findAll(query);
  }
}

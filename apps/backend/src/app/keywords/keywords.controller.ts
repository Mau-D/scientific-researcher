import { Controller, Get, Query } from '@nestjs/common';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Get()
  findAll(@Query('query') query:string) {
   
    return  this.keywordsService.findAll(query);
  }
}

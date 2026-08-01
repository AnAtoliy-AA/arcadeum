import { Module } from '@nestjs/common';
import { GitHubApiService } from './github.api.service';
import { GitHubGitService } from './github.git.service';
import { GitHubService } from './github.service';

@Module({
  providers: [GitHubApiService, GitHubGitService, GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}

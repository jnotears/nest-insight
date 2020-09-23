import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { Injectable, HttpService } from '@nestjs/common';
import { AirTableIssueHandling } from './dtos/airtable.api.dto';
import { AirTableConfig } from './entities/airtable.config.entity';

const enum HttpMethod {
    get,
    post,
    patch
}
@Injectable()
export class AirTableApi {

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService

    ) { }
    private createHeaders(api_key: string): any {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`,
        };
    }

    private createHttpOptions(api_key: string): AxiosRequestConfig {
        return {
            headers: this.createHeaders(api_key),
        };
    }

    private createAirtableApiUrl(base_id: string, table_name: string, record_id: string = '', fields: string[] = [], filter: { field: string; value: string } = { field: '', value: '' }) {
        let field_names = '?';
        let filter_field = '';
        table_name = encodeURI(table_name)
        if (fields && fields.length > 0) {
            fields.forEach(field => {
                field = encodeURI(field);
                field_names += `fields%5B%5D=${field}&`;
            });
        }
        if (filter && filter.field.length > 0) {
            filter.field = encodeURI(filter.field);
            filter.value = encodeURI(filter.value);
            filter_field = `filterByFormula=%28%7B` + filter.field + `%7D%20%3D%20%27` + filter.value + `%27%29`;
        }
        return this.config.get<string>('AIRTABLE_API_URL') + base_id + '/' + table_name + '/' + record_id + field_names + filter_field;
    }

    private async rawData<T>(method: HttpMethod, url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        switch (method) {
            case HttpMethod.post:
                return await this.http.post<T>(url, data, config)
                    .toPromise()
                    .then(response => response.data);
            case HttpMethod.get:
                return await this.http.get<T>(url, config)
                    .toPromise()
                    .then(response => response.data);
            case HttpMethod.patch:
                return await this.http.patch<T>(url, data, config)
                    .toPromise()
                    .then(response => response.data);
            default:
                break;
        }
    }

    createOrUpdateIssues(config: AirTableConfig, issues: AirTableIssueHandling[]) {
        issues.forEach(issue => {
            this.createOrUpdateIssueRecord(config, issue)
        })
    }

    async createOrUpdateIssueRecord(config: AirTableConfig, datas: AirTableIssueHandling) {
        const data = `{
            "fields": {
                ${datas.project_name ? `"Project": "${datas.project_name}",` : ''}
                ${datas.issue.state ? `"Status": "${datas.issue.state}",` : ''}
                ${datas.issue.content ? `"Description": "${datas.issue.content}",` : ''}
                ${datas.issue.created_at ? `"Created At": "${datas.issue.created_at}",` : ''}
                ${datas.issue.updated_at ? `"Updated At": "${datas.issue.updated_at}",` : ''}
                ${datas.issue.estimate ? `"Estimate Time": ${datas.issue.estimate},` : ''}
                ${datas.issue.name ? `"Name": "${datas.issue.name}"` : ''}
            }
        }`;
        if (datas.record_id) {
            const url = this.createAirtableApiUrl(config.base_id, config.table_name, datas.record_id);
            return await this.rawData<any>(HttpMethod.patch, url, data, this.createHttpOptions(config.api_key));
        }
        const url = this.createAirtableApiUrl(config.base_id, config.table_name);
        return await this.rawData<any>(HttpMethod.post, url, data, this.createHttpOptions(config.api_key));
    }

    async getIssuesByProjectName(config: AirTableConfig, project_name: string) {
        const url = this.createAirtableApiUrl(config.base_id, config.table_name, '', [], { field: 'Project', value: project_name });
        return await this.rawData<any>(HttpMethod.get, url, null, this.createHttpOptions(config.api_key));
    }

    async getAllIssues(config: AirTableConfig) {
        const url = this.createAirtableApiUrl(config.base_id, config.table_name);
        return await this.rawData(HttpMethod.get, url, null, this.createHttpOptions(config.api_key));
    }
}


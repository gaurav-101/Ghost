const TableImporter = require('./base');
const {faker} = require('@faker-js/faker');
const {faker: americanFaker} = require('@faker-js/faker/locale/en_US');
const {blogStartDate: startTime} = require('../utils/blog-info');
const generateEvents = require('../utils/event-generator');
const {luck} = require('../utils/random');

class MembersImporter extends TableImporter {
    constructor(knex) {
        super('members', knex);
    }

    setImportOptions({amount}) {
        this.timestamps = generateEvents({
            shape: 'ease-in',
            trend: 'positive',
            total: amount,
            startTime,
            endTime: new Date()
        }).sort();
    }

    generate() {
        const id = faker.database.mongodbObjectId();
        // Use name from American locale to reflect an English-speaking audience
        const name = `${americanFaker.name.firstName()} ${americanFaker.name.lastName()}`;
        const timestamp = this.timestamps.shift();

        return {
            id,
            uuid: faker.datatype.uuid(),
            email: faker.internet.email(name, faker.date.birthdate().getFullYear().toString(), 'examplemail.com').toLowerCase(),
            status: luck(5) ? 'comped' : luck(25) ? 'paid' : 'free',
            name: name,
            expertise: luck(30) ? faker.name.jobTitle() : undefined,
            geolocation: JSON.stringify({
                organization_name: faker.company.name(),
                region: faker.address.state(),
                accuracy: 50,
                asn: parseInt(faker.random.numeric(4)),
                organization: `${faker.random.alpha({count: 2, casing: 'upper'})}${faker.random.numeric(4)} ${faker.company.name()}`,
                timezone: faker.address.timeZone(),
                longitude: faker.address.longitude(),
                country_code3: faker.address.countryCode('alpha-3'),
                area_code: '0',
                ip: faker.internet.ipv4(),
                city: faker.address.cityName(),
                country: faker.address.country(),
                continent_code: 'EU',
                country_code: faker.address.countryCode('alpha-2'),
                latitude: faker.address.latitude()
            }),
            email_count: 0, // Depends on number of emails sent since created_at, the newsletter they're a part of and subscription status
            email_opened_count: 0,
            email_open_rate: null,
            // 40% of users logged in within a week, 60% sometime since registering
            last_seen_at: luck(40) ? faker.date.recent(7).toISOString() : faker.date.between(timestamp, new Date()).toISOString(),
            created_at: timestamp.toISOString(),
            created_by: id,
            updated_at: timestamp.toISOString()
        };
    }
}

module.exports = MembersImporter;

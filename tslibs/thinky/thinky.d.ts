declare module "thinky" {
    import bluebird = require("bluebird");

    function connect(connectionOptions?: connect.ConnectionOptions): connect.Thinky;
    export = connect;

    module connect {
        export interface Model<UDocument extends Document<any, any, any>, UModel extends Model<any, any, any>, UAttributes> extends Table<UDocument>, NodeJS.EventEmitter {
            new (attributes?: UAttributes): UDocument;
            getTableName(): string;
            define(key: string, fn: Function): void;
            defineStatic(key: string, fn: Function): void;
            ensureIndex(name: string, fn?: ExpressionFunction<UDocument>, options?: IndexOptions): void;
            hasOne<SecondUModel extends Model<any, any, any>>(OtherModel: SecondUModel, fieldName: string, leftKey: string, rightKey: string, options: RelationshipOptions);
            belongsTo<SecondUModel extends Model<any, any, any>>(OtherModel: SecondUModel, fieldName: string, leftKey: string, rightKey: string, options: RelationshipOptions);
            hasMany<SecondUModel extends Model<any, any, any>>(OtherModel: SecondUModel, fieldName: string, leftKey: string, rightKey: string, options: RelationshipOptions);
            hasAndBelongsToMany<SecondUModel extends Model<any, any, any>>(OtherModel: SecondUModel, fieldName: string, leftKey: string, rightKey: string, options: RelationshipOptions);
            pre(event: string, hook: HookFunction);
            post(event: string, hook: HookFunction);
            save(object: UAttributes, options?: SaveOptions): bluebird.Thenable<UDocument>;
        }

        export interface Document<UDocument extends Document<any, any, any>, UModel extends Model<any, any, any>, UAttributes> {
            getModel(): UModel;
            merge<OtherUDocument extends Document<any, any, any>>(doc: OtherUDocument): void;
            validate(): Error;
            validate(): bluebird.Thenable<any>;
            validateAll(options?: ValidateAllOptions, modelToValidate?: Model<any, any, any>): bluebird.Thenable<any>;
            save(callback?: (err : Error, doc: UDocument) => void): bluebird.Thenable<UDocument>;
            saveAll(modelToSave: Model<any, any, any>, callback?: (err : Error, doc: UDocument) => void): bluebird.Thenable<UDocument>;
            saveAll(modelToSave: { (fieldName: string): boolean }, callback?: (err : Error, doc: UDocument) => void): bluebird.Thenable<UDocument>;
            isSaved(): boolean;
            getOldValue(): UDocument;
            setSaved(): void;
            delete(callback?: (err : Error, doc: UDocument) => void): bluebird.Thenable<UDocument>;
            deleteAll(modelToDelete: Model<any, any, any>, callback?: (err : Error, doc: UDocument) => void): bluebird.Thenable<UDocument>;
            deleteAll(modelToDelete: { (fieldName: string): boolean }, callback?: (err : Error, doc: UDocument) => void): bluebird.Thenable<UDocument>;
            addRelation<OtherUDocument extends Document<any, any, any>, ResultDocument extends Document<any, any, any>>(field: string, joinedDocument: OtherUDocument): bluebird.Thenable<ResultDocument>;//TODO: improve
            removeRelation<OtherUDocument extends Document<any, any, any>>(field: string, joinedDocument?: OtherUDocument): bluebird.Thenable<UDocument>;
            purge(callback?: (err : Error, doc: UDocument) => void) : bluebird.Thenable<UDocument>;
            //getFeed() : Feed; TODO: create
            //closeFeed() : Feed; TODO: create
            //TODO: implement getJoin
        }

        export interface Thinky {
            r: R;
            type: TypeWrapper;
            Errors: Errors;
            Query: Query;
            createModel<UDocument extends connect.Document<any, any, any>, UModel extends connect.Model<any, any, any>, UAttributes extends Object>(tableName: string, schema: ModelSchema, options?: ModelOptions): UModel;
        }

        export class R {
            count: Aggregator;
            connect(host: ConnectionOptions, cb: (err: Error, conn: Connection) => void);
            dbCreate(name: string): Operation<CreateResult>;

            dbDrop(name: string): Operation<DropResult>;
            dbList(): Operation<string[]>;

            db(name: string): Db;
            table<UDocument extends connect.Document<any, any, any>, UAttributes>(name: string, options?: { useOutdated: boolean }): Table<UDocument>;

            asc(property: string): Sort;
            desc(property: string): Sort;

            sum(prop: string): Aggregator;
            avg(prop: string): Aggregator;

            row(name: string): Expression<any>;
            expr(stuff: any): Expression<any>;

            now(): Time;

            // Control Structures
            branch(test: Expression<boolean>, trueBranch: Expression<any>, falseBranch: Expression<any>): Expression<any>;
        }

        // Control Structures

        export class Cursor {
            hasNext(): boolean;
            each(cb: (err: Error, row: any) => void, done?: () => void);
            each(cb: (err: Error, row: any) => boolean, done?: () => void); // returning false stops iteration
            next(cb: (err: Error, row: any) => void);
            toArray(cb: (err: Error, rows: any[]) => void);
            close();
        }

        export interface ConnectionOptions {
            host: string;
            port: number;
            db?: string;
            authKey?: string;
        }

        export interface Connection {
            close();
            reconnect(cb: (err: Error, conn: Connection) => void);
            use(dbName: string);
            addListener(event: string, cb: Function);
            on(event: string, cb: Function);
        }

        export interface Db {
            tableCreate(name: string, options?: TableOptions): Operation<CreateResult>;
            tableDrop(name: string): Operation<DropResult>;
            tableList(): Operation<string[]>;
            table<UDocument>(name: string, options?: GetTableOptions): Table<UDocument>;
        }

        export interface TableOptions {
            primary_key?: string; // 'id'
            durability?: string; // 'soft'
            cache_size?: number;
            datacenter?: string;
        }

        export interface GetTableOptions {
            useOutdated: boolean;
        }

        export interface Writeable {
            update(obj: Object, options?: UpdateOptions): Operation<WriteResult>;
            replace(obj: Object, options?: UpdateOptions): Operation<WriteResult>;
            replace(expr: ExpressionFunction<any>): Operation<WriteResult>;
            delete(options?: UpdateOptions): Operation<WriteResult>;
        }

        export interface Table<UDocument> extends Sequence<UDocument> {
            indexCreate(name: string, index?: ExpressionFunction<any>): Operation<CreateResult>;
            indexDrop(name: string): Operation<DropResult>;
            indexList(): Operation<string[]>;

            insert(obj: any[], options?: InsertOptions): Operation<WriteResult>;
            insert(obj: any, options?: InsertOptions): Operation<WriteResult>;

            get(key: string): ItemSequence<UDocument>; // primary key
            getAll(key: string, index?: Index): Sequence<UDocument>; // without index defaults to primary key
            getAll(...keys: string[]): Sequence<UDocument>;
        }

        //TODO: change name
        //TODO: inheritance from (or to) Sequence
        export interface ItemSequence<UDocument> extends Operation<UDocument>, Writeable {
            // Join
            // these return left, right
            // TODO: change UDocument to a new interface
            innerJoin(sequence: ItemSequence<UDocument>, join: JoinFunction<boolean>): ItemSequence<UDocument>;
            outerJoin(sequence: ItemSequence<UDocument>, join: JoinFunction<boolean>): ItemSequence<UDocument>;
            eqJoin(leftAttribute: string, rightSequence: ItemSequence<UDocument>, index?: Index): ItemSequence<UDocument>;
            eqJoin(leftAttribute: ExpressionFunction<any>, rightSequence: ItemSequence<UDocument>, index?: Index): ItemSequence<UDocument>;
            zip(): ItemSequence<UDocument>;

            //thinky join
            getJoin<JoinedUDocument extends connect.Document<any, any, any>>(modelToGet : connect.Model<any, any, any>) : ItemSequence<JoinedUDocument>;

            // Transform
            map(transform: ExpressionFunction<any>): ItemSequence<UDocument>;
            withFields(...selectors: any[]): ItemSequence<UDocument>;
            concatMap(transform: ExpressionFunction<any>): ItemSequence<UDocument>;
            orderBy(...keys: string[]): ItemSequence<UDocument>;
            orderBy(...sorts: Sort[]): ItemSequence<UDocument>;
            skip(n: number): ItemSequence<UDocument>;
            limit(n: number): ItemSequence<UDocument>;
            slice(start: number, end?: number): ItemSequence<UDocument>;
            indexesOf(obj: any): ItemSequence<UDocument>;
            isEmpty(): Expression<boolean>;
            union(sequence: ItemSequence<UDocument>): ItemSequence<UDocument>;
            sample(n: number): ItemSequence<UDocument>;

            // Aggregate
            reduce(r: ReduceFunction<any>, base?: any): Expression<any>;
            count(): Expression<number>;
            distinct(): ItemSequence<UDocument>;
            groupedMapReduce(group: ExpressionFunction<any>, map: ExpressionFunction<any>, reduce: ReduceFunction<any>, base?: any): ItemSequence<UDocument>;
            groupBy(...aggregators: Aggregator[]): Expression<Object>; // TODO: reduction object
            contains(prop: string): Expression<boolean>;

            // Manipulation
            pluck(...props: string[]): ItemSequence<any>;
            pluck(props: string[]): ItemSequence<any>;
            without(...props: string[]): ItemSequence<any>;
            without(props: string[]): ItemSequence<any>;

            pluck<T>(...props: string[]): ItemSequence<T>;
            without<T>(...props: string[]): ItemSequence<T>;
        }

        export interface Sequence<UDocument> extends Operation<UDocument[]>, Writeable {

            between(lower: any, upper: any, index?: Index): Sequence<UDocument>;
            filter(rql: ExpressionFunction<boolean>): Sequence<UDocument>;
            filter(rql: Expression<boolean>): Sequence<UDocument>;
            filter(obj: { [key: string]: any }): Sequence<UDocument>;

            // Join
            // these return left, right
            // TODO: change UDocument to a new interface
            innerJoin(sequence: Sequence<UDocument>, join: JoinFunction<boolean>): Sequence<UDocument>;
            outerJoin(sequence: Sequence<UDocument>, join: JoinFunction<boolean>): Sequence<UDocument>;
            eqJoin(leftAttribute: string, rightSequence: Sequence<UDocument>, index?: Index): Sequence<UDocument>;
            eqJoin(leftAttribute: ExpressionFunction<any>, rightSequence: Sequence<UDocument>, index?: Index): Sequence<UDocument>;
            zip(): Sequence<UDocument>;

            //thinky join
            getJoin<JoinedUDocument extends connect.Document<any, any, any>>(modelToGet : connect.Model<any, any, any>) : Sequence<JoinedUDocument>;

            // Transform
            map(transform: ExpressionFunction<any>): Sequence<UDocument>;
            withFields(...selectors: any[]): Sequence<UDocument>;
            concatMap(transform: ExpressionFunction<any>): Sequence<UDocument>;
            orderBy(...keys: string[]): Sequence<UDocument>;
            orderBy(...sorts: Sort[]): Sequence<UDocument>;
            skip(n: number): Sequence<UDocument>;
            limit(n: number): Sequence<UDocument>;
            slice(start: number, end?: number): Sequence<UDocument>;
            nth(n: number): ItemSequence<UDocument>;
            indexesOf(obj: any): Sequence<UDocument>;
            isEmpty(): Expression<boolean>;
            union(sequence: Sequence<UDocument>): Sequence<UDocument>;
            sample(n: number): Sequence<UDocument>;

            // Aggregate
            reduce(r: ReduceFunction<any>, base?: any): Expression<any>;
            count(): Expression<number>;
            distinct(): Sequence<UDocument>;
            groupedMapReduce(group: ExpressionFunction<any>, map: ExpressionFunction<any>, reduce: ReduceFunction<any>, base?: any): Sequence<UDocument>;
            groupBy(...aggregators: Aggregator[]): Expression<Object>; // TODO: reduction object
            contains(prop: string): Expression<boolean>;

            // Manipulation
            pluck(...props: string[]): Sequence<any>;
            without(...props: string[]): Sequence<any>;

            pluck(props: string[]): Sequence<any>;
            without(props: string[]): Sequence<any>;

            pluck<T>(...props: string[]): Sequence<T>;
            without<T>(...props: string[]): Sequence<T>;
            pluck<T>(props: string[]): Sequence<T>;
            without<T>(props: string[]): Sequence<T>;
        }

        export interface ExpressionFunction<U> {
            (doc: Expression<any>): Expression<U>;
        }

        export interface JoinFunction<U> {
            (left: Expression<any>, right: Expression<any>): Expression<U>;
        }

        export interface ReduceFunction<U> {
            (acc: Expression<any>, val: Expression<any>): Expression<U>;
        }

        export interface InsertOptions {
            upsert: boolean; // true
            durability: string; // 'soft'
            return_vals: boolean; // false
        }

        export interface UpdateOptions {
            non_atomic: boolean;
            durability: string; // 'soft'
            return_vals: boolean; // false
        }

        export interface WriteResult {
            inserted: number;
            replaced: number;
            unchanged: number;
            errors: number;
            deleted: number;
            skipped: number;
            first_error: Error;
            generated_keys: string[]; // only for insert
        }

        export interface JoinResult {
            left: any;
            right: any;
        }

        export interface CreateResult {
            created: number;
        }

        export interface DropResult {
            dropped: number;
        }

        export interface Index {
            index: string;
            left_bound?: string; // 'closed'
            right_bound?: string; // 'open'
        }

        export interface Expression<T> extends Writeable, Operation<T> {
            (prop: string): Expression<any>;
            merge(query: Expression<Object>): Expression<Object>;
            append(prop: string): Expression<Object>;
            contains(prop: string): Expression<boolean>;

            //WARNING: is this correct?
            and(b: boolean): Expression<boolean>;
            and(b : Expression<boolean>) : Expression<boolean>;

            or(b: boolean): Expression<boolean>;
            or(b : Expression<boolean>) : Expression<boolean>;

            eq(v: any): Expression<boolean>;
            eq(b : Expression<boolean>) : Expression<boolean>;

            ne(v: any): Expression<boolean>;
            ne(b : Expression<boolean>) : Expression<boolean>;

            not(): Expression<boolean>;

            gt(value: T): Expression<boolean>;
            ge(value: T): Expression<boolean>;
            lt(value: T): Expression<boolean>;
            le(value: T): Expression<boolean>;

            add(n: number): Expression<number>;
            sub(n: number): Expression<number>;
            mul(n: number): Expression<number>;
            div(n: number): Expression<number>;
            mod(n: number): Expression<number>;

            hasFields(...fields: string[]): Expression<boolean>;

            default(value: T): Expression<T>;
        }

        export interface Operation<T> {
            run(): bluebird.Thenable<T>;
        }

        export interface Aggregator { }
        export interface Sort { }

        export interface Time { }


        // http://www.com/api/#js
        // TODO control structures

        export class Type<E> {
            required(): E;
            default(defaultValue: any): E;
            allowNull(state?: boolean): E;
            optional(): E;
            validator<T>(a: (field : T) => boolean): E;
        }

        export class TypeString extends Type<TypeString> {
            min(minLength: number): TypeString;
            max(maxLength: number): TypeString;
            length(lengthValue): TypeString;
            alphanum(): TypeString;
            regex(regex: RegExp, flags?: any): TypeString;//TODO: flags type is incorrect
            email(): TypeString;
            lowercase(): TypeString;
            uppercase(): TypeString;
            enum(values: string[]): TypeString;
            enum(...values : string[]) : TypeString;
        }

        export class TypeNumber extends Type<TypeNumber> {
            min(value: number): TypeNumber;
            max(value: number): TypeNumber;
            integer(): TypeNumber;
        }

        export class TypeBoolean extends Type<TypeBoolean> {

        }

        export class TypeDate extends Type<TypeDate> {
            min(value: Date): TypeDate;
            max(value: Date): TypeDate;
        }

        export class TypeObject extends Type<TypeObject> {
            schema(schema : Type<any>) : TypeObject;
        }

        export class TypeArray extends Type<TypeArray> {
            schema(schema : Type<any>) : TypeArray;
        }

        export class TypeWrapper {
            string(): TypeString;
            number(): TypeNumber;
            boolean(): TypeBoolean;
            date(): TypeDate;
            object() : TypeObject;
            array() : TypeArray;
        }

        export class Errors {
            DocumentNotFound: Error;
        }

        export class Query {
            private version: string;
        }

        export interface ModelOptions {
            pk?: string;
            enforce_missing?: boolean;
            enforce_extra?: string;
            validator?: ValidatorFunction
        }

        export interface ValidatorFunction {
            (): boolean;
        }

        export interface ModelSchema {
            [attrName: string]: Type<any>;
        }

        export interface IndexOptions {
            multi?: boolean;
        }

        export interface RelationshipOptions {
            init?: boolean;
        }

        export interface HookFunction {
            (next: ((error?: any) => void)): void;
        }

        export interface SaveOptions {
            fonclict?: string;
        }

        export interface ValidateAllOptions {
            enforce_missing: boolean;
            enforce_extra: string;
            enforce_type: string;
        }
    }


}

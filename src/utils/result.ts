type ResultType<T, E> = { ok: true; value: T } | { ok: false; error: E }
export class Result<T, E> {
    private constructor(private readonly inner: ResultType<T, E>) {}

    static Ok<T>(value: T): Result<T, never> {
        return new Result({ ok: true, value })
    }

    static Err<E>(error: E): Result<never, E> {
        return new Result({ ok: false, error })
    }

    static try<T, TT = T extends void ? null : T>(fn: () => T): Result<TT, Error> {
        try {
            const val = fn()
            const okValue = val === undefined ? null : val
            return Result.Ok(okValue as TT)
        } catch (err) {
            return Result.Err(err instanceof Error ? err : new Error(String(err)))
        }
    }
    isOk() {
        return this.inner.ok
    }

    isErr() {
        return !this.inner.ok
    }

    unwrap(): T {
        if (this.inner.ok) return this.inner.value
        throw new Error('Tried to unwrap Err: ' + JSON.stringify(this.inner.error))
    }

    unwrapErr(): E {
        if (!this.inner.ok) return this.inner.error
        throw new Error('Tried to unwrapErr Ok: ' + JSON.stringify(this.inner.value))
    }

    map<U>(fn: (val: T) => U): Result<U, E> {
        return this.inner.ok ? Result.Ok(fn(this.inner.value)) : Result.Err(this.inner.error)
    }

    mapErr<F>(fn: (err: E) => F): Result<T, F> {
        return this.inner.ok ? Result.Ok(this.inner.value) : Result.Err(fn(this.inner.error))
    }

    andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
        return this.inner.ok ? fn(this.inner.value) : Result.Err(this.inner.error)
    }

    match<R>(handlers: { Ok: (val: T) => R; Err: (err: E) => R }): R {
        return this.inner.ok ? handlers.Ok(this.inner.value) : handlers.Err(this.inner.error)
    }
}

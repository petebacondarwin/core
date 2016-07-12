import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription, ISubscription } from 'rxjs/Subscription';
import { throwError } from 'rxjs/util/throwError';
import { ObjectUnsubscribedError } from 'rxjs/util/ObjectUnsubscribedError';


export class CacheSubject<T> extends Subject<T> {

  constructor(private _value: T) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const subscription = super._subscribe(subscriber);
    if (subscription && !(<ISubscription>subscription).isUnsubscribed) {
      subscriber.next(this._value);
    }
    return subscription;
  }


  next(value: T): void {
    super.next(this._value = value);
  }
}
